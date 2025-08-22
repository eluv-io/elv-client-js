const URI = require("urijs");
const Fetch = typeof fetch !== "undefined" ? fetch : require("node-fetch").default;
const {LogMessage} = require("./LogMessage");
const Utils = require("./Utils");
const UrlJoin = require("url-join");

class HttpClient {
  Log(message, error=false) {
    LogMessage(this, message, error);
  }

  constructor({uris, debug, normalizePath=false}) {
    this.uris = uris;
    this.uriIndex = 0;
    this.debug = debug;
    this.draftURIs = {};
    this.retries = Math.max(3, uris.length);
    this.normalizePath = normalizePath;
  }

  BaseURI(uriIndex) {
    if(uriIndex === undefined) { uriIndex = this.uriIndex; }
    return new URI(this.uris[uriIndex]);
  }

  static Fetch(url, params={}) {
    return Fetch(url, params);
  }

  RecordWriteToken(writeToken, nodeUrlStr) {
    if(!nodeUrlStr) throw Error("RecordWriteToken() - nodeUrlStr not supplied");
    if(!writeToken) throw Error("RecordWriteToken() - writeToken not supplied");
    this.draftURIs[writeToken] = new URI(nodeUrlStr);
  }

  ClearWriteToken({writeToken}) {
    if(Object.hasOwn(this.draftURIs, writeToken)) {
      delete this.draftURIs[writeToken];
    }
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
    allowRetry=true,
    uriIndex
  }) {
    let baseURI = this.BaseURI(uriIndex);

    // If URL contains a write token, it must go to the correct server and can not fail over
    const writeTokenMatch = path.replace(/^\//, "").match(/(qlibs\/ilib[a-zA-Z0-9]+|q|qid)\/(tqw__[a-zA-Z0-9]+)/);
    const writeToken = writeTokenMatch ? writeTokenMatch[2] : undefined;
    let writeTokenCached = false;

    if(writeToken) {
      allowFailover = false;

      if(this.draftURIs[writeToken]) {
        // Use saved write token URI
        baseURI = this.draftURIs[writeToken];
        writeTokenCached = true;
      } else {
        // Save current URI for all future requests involving this write token
        this.draftURIs[writeToken] = baseURI;
      }
    }

    const normalizedPath = (this.normalizePath && !writeTokenCached) ? UrlJoin(baseURI.path(), path).replace("/as/as", "/as") : path;

    let uri = baseURI
      .path(normalizedPath)
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
    if(this.debug) {
      this.Log(`${method} - ${uri.toString()}`);
      this.Log(`fetchParameters: ${JSON.stringify(fetchParameters, null, 2)}`);
    }
    try {
      response =
        await HttpClient.Fetch(
          uri.toString(),
          fetchParameters
        );
    } catch(error) {
      response = {
        ok: false,
        status: (error && error.status) || 500,
        statusText: "ElvClient Error: " + error.message,
        url: uri.toString(),
        error
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
          uriIndex,
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
        requestParams: fetchParameters,
        response
      };

      if(this.debug) this.Log(
        JSON.stringify(error, null, 2),
        true
      );

      throw error;
    }

    this.Log(`${response.status} - ${method} ${uri.toString()}`);

    return response;
  }

  async RequestAll({
    method,
    path,
    queryParams={},
    body,
    bodyType="JSON",
    headers={},
  }) {
    return await Promise.all(
      Array.from(new Array(this.uris.length).keys())
        .map(async uriIndex => {
          try {
            return await this.Request({
              method,
              path,
              queryParams,
              body,
              bodyType,
              headers,
              allowFailover: false,
              uriIndex
            });
          } catch(error) {
            return error;
          }
        })
    );
  }

  // Perform http request and then return response body parsed as JSON
  // ResponseToJson() will log response if this.debug === true
  async RequestJsonBody(params) {
    return Utils.ResponseToJson(
      this.Request(params),
      this.debug,
      this.Log.bind(this)
    );
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

    const normalizedPath = (this.normalizePath && !this.draftURIs[writeToken]) ? UrlJoin(baseURI.path(), path).replace("/as/as", "/as") : path;

    return (
      baseURI
        .path(normalizedPath)
        .query(queryParams)
        .hash("")
        .toString()
    );
  }
}

module.exports = HttpClient;
