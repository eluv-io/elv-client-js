### Initialize Client
```angular2html
const client = await ElvClient.FromConfigurationUrl({
  configUrl: ClientConfiguration["config-url"],
  noAuth: true
});

// Link wallet to the client via a private key
let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  privateKey: process.env.PRIVATE_KEY
});
client.SetSigner({signer});
```

### List Library Objects
Provide the library id as well as the path (to query param select) to return the proper metadata subtree.
```angular2html
const response = await client.ContentObjects({
  libraryId: "ilibxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  filterOptions: {
    limit: 100000,
    select: "public"
  }
});
```

##### Sample Response

```
{
  contents: [
    {
    "id": "iq__xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "versions": [
      {
        "id": "iq__xxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "hash": "hq__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "type": "",
        "qlib_id": "ilibxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "meta": {
          "public": {
            "description": "",
            "name": "Video Slider"
          }
        }
      }
    ]
  },
  {
    "id": "iq__xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "versions": [
      {
        "id": "iq__xxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "hash": "hq__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "type": "",
        "qlib_id": "ilibxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "meta": {
          "public": {
            "description": "",
            "name": "Video"
          }
        }
      }
    ]
  },
  ],
  paging: {
    cached: true,
    next: 0,
    previous: 0,
    first: 0,
    last: 0,
    current: 0,
    pages: 1,
    limit: 100000,
    items: 23
  }
}
```

### Get Content Object Metadata
Use the response from above to obtain additional metadata (private) for each object.
```angular2html
const objectsMetadata = Promise.all(response.contents.map(async (object) => {
    const objectMetadata = await client.ContentObjectMetadata({
      libraryId,
      objectId: object.id
    });

    return objectMetadata;
}));
```

##### Sample Response
```
[
  {
    "commit": {
      "author": "Admin",
      "author_address": "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "message": "Add title",
      "timestamp": "2021-11-02T23:35:17.127Z"
    },
    "public": {
      "description": "",
      "name": "Properties"
    }
  },
  {
    "commit": {
      "author": "Marc",
      "author_address": "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "message": "Fabric Browser form",
      "timestamp": "2021-11-02T23:35:17.127Z"
    },
    "public": {
      "description": "",
      "name": "Title Collection"
    }
  },
]
```