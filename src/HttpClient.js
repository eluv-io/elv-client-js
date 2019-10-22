const URI = require("urijs");

const Fetch = (input, init={}) => {
  if(typeof fetch === "undefined") {
    return (require("node-fetch")(input, init));
  } else {
    return fetch(input, init);
  }
};

class HttpClient {
  constructor(uris) {
    this.uris = uris;
    this.uriIndex = 0;
  }

  BaseURI() {
    return new URI(this.uris[this.uriIndex]);
  }

  RequestHeaders(bodyType, headers={}) {
    headers["Accept"] = "application/json";
    if(bodyType === "JSON") {
      headers["Content-type"] = "application/json";
    } else {
      headers["Content-type"] = "application/octet-stream";
    }

    return headers;
  }

  async Request({
    method,
    path,
    queryParams={},
    body={},
    bodyType="JSON",
    headers={},
    attempts=0,
    failover=true
  }) {
    let uri = this.BaseURI()
      .path(path)
      .query(queryParams)
      .hash("");

    let fetchParameters = {
      method: method,
      headers: this.RequestHeaders(bodyType, headers),
    };

    if(method === "POST" || method === "PUT") {
      if(bodyType === "JSON") {
        fetchParameters.body = JSON.stringify(body);
      } else {
        fetchParameters.body = body;
      }
    }

    let response;

    try {
      response =
        await Fetch(
          uri.toString(),
          fetchParameters
        );
    } catch(error) {
      response = {
        ok: false,
        status: 418,
        statusText: "ElvClient Error: " + error.message,
        url: uri.toString(),
        stack: error.stack
      };
    }

    if(!response.ok) {
      if(failover && parseInt(response.status) >= 500 && attempts < this.uris.length) {
        // Server error - Try next node
        this.uriIndex = (this.uriIndex + 1) % this.uris.length;

        return await this.Request({
          method,
          path,
          queryParams,
          body,
          bodyType,
          headers,
          attempts: attempts + 1
        });
      }

      // Parse JSON error if headers indicate JSON
      const responseType = response.headers.get("content-type");

      let errorBody = "";
      if(response.text && response.json) {
        errorBody = responseType.includes("application/json") ? await response.json() : await response.text();
      }

      throw {
        name: "ElvHttpClientError",
        status: response.status,
        statusText: response.statusText,
        message: response.statusText,
        url: uri.toString(),
        body: errorBody,
        requestParams: fetchParameters
      };
    }

    return response;
  }

  URL({path, queryParams={}}) {
    return (
      this.BaseURI()
        .path(path)
        .query(queryParams)
        .hash("").toString()
    );
  }
}

module.exports = HttpClient;
