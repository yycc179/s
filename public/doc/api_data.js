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
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"version\": 0.1.0,\n  \"valid\": true,\n  \"period\": 3600\n}",
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
            "description": "<p>stack info,only in development env</p>"
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
            "field": "next_update",
            "description": "<p>next update interval/seconds</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"next_update\": 3600\n}",
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
            "description": "<p>stack info,only in development env</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/server/index.js",
    "groupTitle": "PEER",
    "sampleRequest": [
      {
        "url": "/api/update"
      }
    ]
  },
  {
    "type": "get",
    "url": "/query",
    "title": "get attenuation",
    "name": "getAtt",
    "group": "QOS",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "local",
            "description": "<p>local snr value</p>"
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
            "optional": true,
            "field": "att",
            "description": "<p>attenuation snr.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": true,
            "field": "att_inc",
            "description": "<p>attenuation inc snr.</p>"
          },
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
            "field": "next_query",
            "description": "<p>next query internal/seconds.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response-1:",
          "content": "HTTP/1.1 200 OK\n{\n  \"att\": 5,\n  \"next_query\": 5\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-2:",
          "content": "HTTP/1.1 200 OK\n{\n  \"att_inc\": 0.2,\n  \"next_query\": 5\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-3:",
          "content": "HTTP/1.1 200 OK\n{\n  \"next_query\": 3600     //sleep\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-4:",
          "content": "HTTP/1.1 200 OK\n{\n  \"err\": \"no data\",           \n  \"next_query\": 5\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 \n{\n  \"err\": \"config first\"\n}",
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
            "description": "<p>stack info,only in development env</p>"
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
