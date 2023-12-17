# Introduction
This is a boilerplate plugin.

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"Shelly Gen 1 Integration",
   "version":1,
   "intents":[
      "devices",
      "endpoints",
      "mdns"
   ],
   "uuid": "79ff8232-3084-4bbc-8e9c-42bb03203fb0"
}

```
Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-shelly-gen1/ ~/projects/OpenHaus/backend/plugins/79ff8232-3084-4bbc-8e9c-42bb03203fb0/
```

# Supported/Tested devices

| Model    | Implemented | Tested | Link                                                         |
| -------- | ----------- | ------ | ------------------------------------------------------------ |
| SHIX3-1  | ✅           | ✅      | https://shelly-api-docs.shelly.cloud/gen1/#shelly-i3         |
| SHPLG2-1 | ✅           | ✅      | https://shelly-api-docs.shelly.cloud/gen1/#shelly-plug-plugs |
| SHRGB2   | ✅           | ✅      | https://shelly-api-docs.shelly.cloud/gen1/#shelly-flood      |
| SHSW-25  | ✅           | ✅      | https://shelly-api-docs.shelly.cloud/gen1/#shelly2-5         |
| SHSW-PM  | ✅           | ✅      | https://shelly-api-docs.shelly.cloud/gen1/#shelly1-shelly1pm |
| SHWT-1   | ✅           | ❌      | https://shelly-api-docs.shelly.cloud/gen1/#shelly-flood      |