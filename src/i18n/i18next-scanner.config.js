// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

module.exports = {
  input: [
    "app/**/*.{js,jsx}",
    "app/**/*.{ts,tsx}",
    // Use ! to filter out files or directories
    "!app/**/*.test.{ts,tsx}",
    "!app/i18n/**",
    "!**/node_modules/**",
  ],
  output: "./",
  options: {
    debug: true,
    func: {
      list: ["i18next.t", "i18n.t", "t"],
      extensions: [".ts", ".tsx"],
    },
    // trans: {
    //   component: "Trans",
    //   i18nKey: "i18nKey",
    //   defaultsKey: "defaults",
    //   extensions: [".ts", ".tsx"],
    //   fallbackKey: function (ns, value) {
    //     return value;
    //   },
    //   acorn: {
    //     ecmaVersion: 2020,
    //     sourceType: "module", // defaults to 'module'
    //     // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
    //   },
    // },
    lngs: ["en", "nb-NO"],
    ns: ["translation"],
    defaultLng: "nb-NO",
    defaultNs: "translation",
    defaultValue: "__STRING_NOT_TRANSLATED__",
    resource: {
      loadPath: "public/locales/{{lng}}/{{ns}}.json",
      savePath: "public/locales/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      lineEnding: "\n",
    },
    nsSeparator: ":", // namespace separator
    keySeparator: ".", // key separator
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
  },
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(
      content,
      { list: ["i18next._", "i18next.__"] },
      (key, options) => {
        parser.set(
          key,
          Object.assign({}, options, {
            nsSeparator: false,
            keySeparator: false,
          })
        );
        ++count;
      }
    );

    if (count > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `i18next-scanner: count=${count}, file=${JSON.stringify(file.relative)}`
      );
    }

    done();
  },
};
