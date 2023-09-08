const URI = require("urijs");
const Fetch = typeof fetch !== "undefined" ? fetch : require("node-fetch").default;
const {LogMessage} = require("./LogMessage");

class HttpClient {
  Log(message, error=false) {
    LogMessage(this, message, error);
  }

  constructor({uris, debug}) {
    this.uris = uris;
    this.uriIndex = 0;
    this.debug = debug;
    this.draftURIs = {};
    this.retries = Math.max(3, uris.length);
  }

  BaseURI() {
    return new URI(this.uris[this.uriIndex]);
  }

  static Fetch(url, params={}) {
    return Fetch(url, params);
  }

  RecordWriteToken(writeToken, nodeUrlStr) {
    if(!nodeUrlStr) throw Error("RecordWriteToken() - nodeUrlStr not supplied");
    if(!writeToken) throw Error("RecordWriteToken() - writeToken not supplied");
    this.draftURIs[writeToken] = new URI(nodeUrlStr);
  }

  RequestHeaders(bodyType, headers={}) {
    if(!headers.Accept) {
      headers["Accept"] = "application/json";
    }

    if(bodyType === "JSON") {
      headers["Content-type"] = "application/json";
    } else if(bodyType === "BINARY") {
      headers["Content-type"] = "application/octet-stream";
    }

    return headers;
  }

  async Request({
    method,
    path,
    queryParams={},
    body,
    bodyType="JSON",
    headers={},
    attempts=0,
    allowFailover=true,
    forceFailover=false,
    allowRetry=true
  }) {
    let baseURI = this.BaseURI();

    // If URL contains a write token, it must go to the correct server and can not fail over
    const writeTokenMatch = path.replace(/^\//, "").match(/(qlibs\/ilib[a-zA-Z0-9]+|q|qid)\/(tqw__[a-zA-Z0-9]+)/);
    const writeToken = writeTokenMatch ? writeTokenMatch[2] : undefined;

    if(writeToken) {
      allowFailover = false;

      if(this.draftURIs[writeToken]) {
        // Use saved write token URI
        baseURI = this.draftURIs[writeToken];
      } else {
        // Save current URI for all future requests involving this write token
        this.draftURIs[writeToken] = baseURI;
      }
    }

    let uri = baseURI
      .path(path)
      .query(queryParams)
      .hash("");

    let fetchParameters = {
      method,
      headers: this.RequestHeaders(bodyType, headers)
    };

    if(method === "POST" || method === "PUT" || method === "DELETE") {
      if(body && bodyType === "JSON") {
        fetchParameters.body = JSON.stringify(body);
      } else if(body) {
        fetchParameters.body = body;
      }
    }

    let response;
    this.Log(`${method} - ${uri.toString()}`);
    try {
      response =
        await HttpClient.Fetch(
          uri.toString(),
          fetchParameters
        );
    } catch(error) {
      response = {
        ok: false,
        status: 500,
        statusText: "ElvClient Error: " + error.message,
        url: uri.toString(),
        stack: error.stack
      };
    }

    if(!response.ok) {
      // Fail over if not a write token request, the response was a server error, and we haven't tried all available nodes
      if(
        (parseInt(response.status) >= 500 || forceFailover) &&
        allowRetry &&
        attempts < this.retries
      ) {
        // Server error
        if(allowFailover) {
          // Fail over to alternate node
          this.uriIndex = (this.uriIndex + 1) % this.uris.length;
          this.Log(`HttpClient failing over from ${baseURI.toString()}: ${attempts + 1} attempts`, true);
        } else {
          // Wait and retry
          this.Log(`HttpClient retrying request from ${baseURI.toString()}: ${attempts + 1} attempts`, true);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return await this.Request({
          method,
          path,
          queryParams,
          body,
          bodyType,
          headers,
          attempts: attempts + 1,
          forceFailover
        });
      }

      // Parse JSON error if headers indicate JSON
      const responseType = response.headers ? response.headers.get("content-type") || "" : "";

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
    let baseURI = this.BaseURI();

    // If URL contains a write token, it must go to the correct server and can not fail over
    const writeTokenMatch = path.replace(/^\//, "").match(/(qlibs\/ilib[a-zA-Z0-9]+|q|qid)\/(tqw__[a-zA-Z0-9]+)/);
    const writeToken = writeTokenMatch ? writeTokenMatch[2] : undefined;

    if(writeToken && this.draftURIs[writeToken]) {
      // Use saved write token URI
      baseURI = this.draftURIs[writeToken];
    }

    return (
      baseURI
        .path(path)
        .query(queryParams)
        .hash("")
        .toString()
    );
  }
}

module.exports = HttpClient;
