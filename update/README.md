Firefox does not support private listings on [AMO](https://addons.mozilla.org/), therefore the extension is distributed as an `.xpi` file. To enable updates an update manifest has to be provided under the `update_url` key in the extensions manifest. The `updates.json` file in this directory is hosted on Azure under the `update_url` (see `src/extension/manifest.json`). The realease `.xpi` files are also hosted on Azure.