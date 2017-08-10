define({ "api": [
  {
    "type": "get",
    "url": "/config",
    "title": "get config",
    "group": "GENERAL",
    "name": "getConfig",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "t",
            "description": "<p>type, p | q</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "m",
            "description": "<p>mac address</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>version info</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "valid",
            "description": "<p>acitve state.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "period",
            "description": "<p>request peroid/seconds.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response-peer:",
          "content": "HTTP/1.1 200 OK\n{\n  \"version\": \"0.1.0\",\n  \"valid\": true,\n  \"period\": 3600\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-qos:",
          "content": "HTTP/1.1 200 OK\n{\n  \"version\": \"0.1.0\",\n  \"valid\": true,\n  \"period\": 10\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/server/index.js",
    "groupTitle": "GENERAL",
    "sampleRequest": [
      {
        "url": "/api/config"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "err",
            "description": "<p>err info</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": true,
            "field": "stack",
            "description": "<p>stack info, only in development env</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404\n{\n  \"err\": \"invalid request\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/update",
    "title": "post snr",
    "name": "postSnr",
    "group": "PEER",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-type",
            "description": "<p>application/json.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "snr",
            "description": "<p>SNR value</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "m",
            "description": "<p>mac address</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "next",
            "description": "<p>next update interval/seconds</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"next\": 3600\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 \n{\n  \"err\": \"invalid data\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404\n{\n  \"err\": \"invalid request\"\n}",
          "type": "json"
        }
      ],
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "err",
            "description": "<p>err info</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": true,
            "field": "stack",
            "description": "<p>stack info, only in development env</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/server/index.js",
    "groupTitle": "PEER"
  },
  {
    "type": "post",
    "url": "/query",
    "title": "query attenuation and antenna status",
    "name": "postAtt",
    "group": "QOS",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "err",
            "description": "<p>err info.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "next",
            "description": "<p>next query internal/seconds.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "att",
            "description": "<p>att detail.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": true,
            "field": "antenna",
            "description": "<p>antenna setting params.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response-ok:",
          "content": "HTTP/1.1 200 OK\n{\n  \"next\": 10, \n  \"att\": {\n     \"aim\": 3,\n     \"step\": 0.5,\n     \"inv\": 5,\n  },\n  \"antenna\": {\n     \"lnb\": {\n         \"freq\": 196608005,\n         \"type\": 0\n     },\n     \"tp\": {\n         \"polar\": 0,\n         \"rate\": 5,\n         \"freq\": 9\n     }\n  }\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-ok2:",
          "content": "HTTP/1.1 200 OK\n{\n  \"next\": 10, \n  \"att\": {\n     \"aim\": 3,\n     \"step\": 0.5,\n     \"inv\": 5,\n  }",
          "type": "json"
        },
        {
          "title": "Success-Response-no-data:",
          "content": "HTTP/1.1 200 OK\n{\n  \"err\": \"no data\",           \n  \"next\": 5\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 \n{\n  \"err\": \"config first\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404\n{\n  \"err\": \"invalid request\"\n}",
          "type": "json"
        }
      ],
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "err",
            "description": "<p>err info</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": true,
            "field": "stack",
            "description": "<p>stack info, only in development env</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/server/index.js",
    "groupTitle": "QOS",
    "sampleRequest": [
      {
        "url": "/api/query"
      }
    ]
  }
] });
