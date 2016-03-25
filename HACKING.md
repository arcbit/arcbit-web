Testing
-----------

We use the tool `karma` to run the tests.

All the following commands should be done from the arcbit root folder.

### Setup your environment

```sh
$ npm -d install
$ npm install -g karma-cli # you may need sudo here
```

### Running the tests

```sh
$ karma start test/karma.conf.js
```

Javascript tasks
-----------

To update or modify dependencies you may need the following information:

### Adding/Upgrading dependencies with bower
If you want to add/upgrade a dependency, use bower.

```bash
$ bower install angular --save # --save option modify bower.json file
```

Read [bower documentation](http://bower.io) for more info.


Icon set
-----------

You can use the following cheatsheet to look for icon codes:

 - http://fortawesome.github.io/Font-Awesome/cheatsheet/

Search other icon sets for useful icons:

 - http://icomoon.io
