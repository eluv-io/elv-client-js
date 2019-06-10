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

  RequestHeaders(bodyType, headers={}) {
    headers["Accept"] = "application/json";
    if(bodyType === "JSON") {
      headers["Content-type"] = "application/json";
    } else {
      headers["Content-type"] = "application/octet-stream";
    }

    return headers;
  }

  async Request({method, path, queryParams={}, body={}, bodyType="JSON", headers={}, attempts=0}) {
    let uri = new URI(this.uris[this.uriIndex])
      .path(path)
      .query(queryParams)
      .hash("");

    let fetchParameters = {
      method: method,
      headers: this.RequestHeaders(bodyType, headers),
    };

    if(method === "POST" || method === "PUT") {
      if(bodyType === "JSON") {
        fetchParameters["body"] = JSON.stringify(body);
      } else {
        fetchParameters["body"] = body;
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
        status: 500,
        statusText: error.message,
        url: uri.toString(),
        ...fetchParameters,
        stack: error.stack
      };
    }

    if(!response.ok) {
      if(response.status === 500 && attempts < this.uris.length) {
        // Try next node
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

      throw {
        name: "ElvHttpClientError",
        status: response.status,
        statusText: response.statusText,
        message: response.statusText,
        url: uri.toString(),
        ...fetchParameters,
      };
    }

    return response;
  }

  URL({path, queryParams={}}) {
    return (
      this.baseURI
        .path(path)
        .query(queryParams)
        .hash("").toString()
    );
  }
}

module.exports = HttpClient;
