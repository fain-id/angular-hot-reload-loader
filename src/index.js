var utils = require('loader-utils');
var path = require('path');

module.exports = function angularHotReloadLoader(source, sourcemap) {
    this.cacheable && this.cacheable();

    var query = utils.getOptions(this) || {};

    var newSource = source;
    if (query.rootModule) {
        var config = query.rootModule.split('#');
        var sourcePath = config[0];
        var moduleName = config[1];
        var resourcePath = path.resolve(sourcePath);
        if (this.resourcePath === resourcePath || this.resourcePath === resourcePath + '.ts') {
            var reg = new RegExp('class\\s+' + moduleName + '\\s*\\{', 'gm');
            var imports = 'import { removeNgStyles, createNewHosts, createInputTransfer } from \'@angularclass/hmr\';\n';
            newSource = imports + source.replace(/\{([^}]|\n)(?=\}\s*from\s+['"]@angular\/core['"])/g, function (str) {
                if (!/ApplicationRef/.test(str)) {
                    return str + ', ApplicationRef ';
                }
                return str;
            }).replace(reg, function (str) {
                return str + '\n' +

                    '    constructor(public appRef: ApplicationRef) {\n' +
                    '    }\n' +
                    '    hmrOnInit(store: any) {\n' +
                    '        if (!store || !store.state) return;\n' +
                    '        console.log(\'HMR store\', store);\n' +
                    '        console.log(\'store.state.data:\', store.state.data);\n' +
                    '        // inject AppStore here and update it\n' +
                    '        // this.AppStore.update(store.state)\n' +
                    '        if (\'restoreInputValues\' in store) {\n' +
                    '            store.restoreInputValues();\n' +
                    '        }\n' +
                    '        // change detection\n' +
                    '        this.appRef.tick();\n' +
                    '        delete store.state;\n' +
                    '        delete store.restoreInputValues;\n' +
                    '    }\n' +
                    '    hmrOnDestroy(store: any) {\n' +
                    '        let cmpLocation = this.appRef.components.map((cmp: any) => cmp.location.nativeElement);\n' +
                    '        // recreate elements\n' +
                    '        store.disposeOldHosts = createNewHosts(cmpLocation);\n' +
                    '        // inject your AppStore and grab state then set it on store\n' +
                    '        // var appState = this.AppStore.get()\n' +
                    '        store.state = {data: \'yolo\'};\n' +
                    '        // store.state = Object.assign({}, appState)\n' +
                    '        // save input values\n' +
                    '        store.restoreInputValues = createInputTransfer();\n' +
                    '        // remove styles\n' +
                    '        removeNgStyles();\n' +
                    '    }\n' +
                    '    hmrAfterDestroy(store: any) {\n' +
                    '        // display new elements\n' +
                    '        store.disposeOldHosts();\n' +
                    '        delete store.disposeOldHosts;\n' +
                    '        // anything you need done the component is removed\n' +
                    '    }';
            });
        }

        var bootstrapModule = new RegExp('(\\.bootstrapModule|\\.bootstrapModuleFactory)\\(' + moduleName + '\\)', 'gm');

        var hotStr = '.then((MODULE_REF: any) => {\n' +
            '    if (module[\'hot\']) {\n' +
            '        module[\'hot\'][\'accept\']();\n' +
            '        if (MODULE_REF.instance[\'hmrOnInit\']) {\n' +
            '            module[\'hot\'][\'data\'] && MODULE_REF.instance[\'hmrOnInit\'](module[\'hot\'][\'data\']);\n' +
            '        }\n' +
            '        if (MODULE_REF.instance[\'hmrOnStatus\']) {\n' +
            '            module[\'hot\'][\'apply\']((status: any) => {\n' +
            '                MODULE_REF.instance[\'hmrOnStatus\'](status);\n' +
            '            });\n' +
            '        }\n' +
            '        if (MODULE_REF.instance[\'hmrOnCheck\']) {\n' +
            '            module[\'hot\'][\'check\']((err: any, outdatedModules: any) => {\n' +
            '                MODULE_REF.instance[\'hmrOnCheck\'](err, outdatedModules);\n' +
            '            });\n' +
            '        }\n' +
            '        if (MODULE_REF.instance[\'hmrOnDecline\']) {\n' +
            '            module[\'hot\'][\'decline\']((dependencies: any) => {\n' +
            '                MODULE_REF.instance[\'hmrOnDecline\'](dependencies);\n' +
            '            });\n' +
            '        }\n' +
            '        module[\'hot\'][\'dispose\']((store: any) => {\n' +
            '            MODULE_REF.instance[\'hmrOnDestroy\'] && MODULE_REF.instance[\'hmrOnDestroy\'](store);\n' +
            '            MODULE_REF.destroy();\n' +
            '            MODULE_REF.instance[\'hmrAfterDestroy\'] && MODULE_REF.instance[\'hmrAfterDestroy\'](store);\n' +
            '        });\n' +
            '    }\n' +
            '    return MODULE_REF;\n' +
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
