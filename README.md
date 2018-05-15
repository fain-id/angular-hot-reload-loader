# angular-hot-reload-loader

```bash
npm i @angularclass/hmr angular-hot-relaod-loader -D
```

```js
// # webpack.config.js

module.exports = {
    module: {
        rules: [{
            test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
            use: isProduction ? ['@ngtools/webpack'] : ['ng-router-loader', 'awesome-typescript-loader', 'angular2-template-loader', {
                loader: 'angular-hot-reload-loader',
                options: {
                    rootModule: './src/app/app.module#AppModule'
                }
            }]
        }]
    }
}
```