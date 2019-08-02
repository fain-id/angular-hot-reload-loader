var utils = require('loader-utils');

module.exports = function angularHotReloadLoader(source, sourcemap) {
    this.cacheable && this.cacheable();

    var query = utils.getOptions(this) || {};

    var newSource = source;
    if (query.rootModule) {
        var config = query.rootModule.split('#');
        var moduleName = config[1];

        var bootstrapModule = new RegExp('(\\.bootstrapModule|\\.bootstrapModuleFactory)\\(' + moduleName + '\\)', 'gm');
        var hotStr = '.then((moduleRef: any) => {' +
                     '  if(module[\'hot\']) {'+
                     '    module[\'hot\'][\'accept\']();'+
                     '  }'+
                     '  return moduleRef;'+
                     '})';

        newSource = newSource.replace(bootstrapModule, function (str) {
            return str + hotStr;
        });
    }
    if (this.callback) {
        this.callback(null, newSource, sourcemap)
    } else {
        return newSource;
    }
};
