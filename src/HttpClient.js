const URI = require("urijs");

const Fetch = (input, init={}) => {
  if(typeof fetch === "undefined") {
    return (require("node-fetch")(input, init));
  } else {
    return fetch(input, init);
  }
};

class HttpClient {
  Log(message, error=false) {
    if(!this.debug) { return; }

    if(typeof message === "object") {
      message = JSON.stringify(message);
    }

    error ?
      // eslint-disable-next-line no-console
      console.error(`\n(elv-client-js#HttpClient) ${message}\n`) :
      // eslint-disable-next-line no-console
      console.log(`\n(elv-client-js#HttpClient) ${message}\n`);
  }

  constructor({uris, debug}) {
    this.uris = uris;
    this.uriIndex = 0;
    this.debug = debug;
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
      method,
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

        this.Log(`HttpClient failing over: ${attempts + 1} attempts`, true);

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
      const responseType = response.headers ? response.headers.get("content-type") : "";

      let errorBody = "";
      if(response.text && response.json) {
        errorBody = responseType.includes("application/json") ? await response.json() : await response.text();
      }

      const error = {
        name: "ElvHttpClientError",
        status: response.status,
        statusText: response.statusText,
        message: response.statusText,
        url: uri.toString(),
        body: errorBody,
        requestParams: fetchParameters
      };

      this.Log(
        JSON.stringify(error, null, 2),
        true
      );

      throw error;
    }

    this.Log(`${response.status} - ${method} ${uri.toString()}`);

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
