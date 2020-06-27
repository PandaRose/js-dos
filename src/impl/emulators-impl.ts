import { Build } from "../build";
import { Emulators, Logger, CommandInterface } from "../emulators";
import { Cache, CacheDb, CacheNoop } from "../cache";

import { IWasmModules, WasmModulesImpl } from "./modules";

import DosBundle from "../dos/bundle/dos-bundle";
import DosDirect from "../dos/direct/ts/direct";
import DosWorker from "../dos/worker/ts/worker";

class EmulatorsImpl implements Emulators {
    pathPrefix = "";

    private wasmModulesPromise?: Promise<IWasmModules>;
    private cache: Cache;
    private logger: Logger;

    constructor() {
        this.cache = new CacheNoop();
        this.logger = {
            onLog(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.log(...args);
            },
            onWarn(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.warn(...args);
            },
            onErr(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.error(...args);
            },
        };
    }

    async dosBundle(): Promise<DosBundle> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();
        return new DosBundle(libzipWasm, this.cache);
    }

    async dosDirect(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosDirectWasm = await modules.dosDirect();
        return DosDirect(dosDirectWasm, bundle, this.logger);
    }

    async dosWorker(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosWorkerWasm = await modules.dosWorker();
        return DosWorker(this.pathPrefix + "wworker.js", dosWorkerWasm, bundle, this.logger);
    }

    wasmModules(): Promise<IWasmModules> {
        if (this.wasmModulesPromise !== undefined) {
            return this.wasmModulesPromise;
        }

        const make = async () => {
            this.cache = await CacheDb(Build.version, this.logger);
            return new WasmModulesImpl(this.pathPrefix, this.cache);
        }

        this.wasmModulesPromise = make();
        return this.wasmModulesPromise;
    }

}

const emulators = new EmulatorsImpl();
export default emulators;