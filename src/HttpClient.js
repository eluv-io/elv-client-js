const Fetch = (input, init={}) => {
  if(typeof fetch === "undefined") {
    return (require("node-fetch")(input, init));
  } else {
    return fetch(input, init);
  }
};

class HttpClient {
  constructor(baseURI) {
    this.baseURI = baseURI;
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

  async Request({method, path, queryParams={}, body={}, bodyType="JSON", headers={}}) {
    let uri = this.baseURI
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
        ...fetchParameters
      };
    }

    if(!response.ok) {
      throw {
        name: "ElvHttpClientError",
        status: response.status,
        statusText: response.statusText,
        message: response.statusText,
        url: uri.toString(),
        ...fetchParameters
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
