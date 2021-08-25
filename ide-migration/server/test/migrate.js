const MigrationController = require('xsk-ide-migration/ide-migration/server/migration/controllers/migrate');
const TunnelController = require('xsk-ide-migration/ide-migration/server/migration/controllers/tunnel-controller')

const migrationController = new MigrationController();
const tunnelController = new TunnelController();

let neoCredentials = null;

let callback = __context.get("__async_callback");

function openTunnelTest() {
    console.log("opening tunnel...")
    let credentials = {
            account: __context.get("__account"),
            host: __context.get("__host"),
            user: __context.get("__user"),
            password: __context.get("__password"),
            db: __context.get("__db")
        }

    tunnelController.openTunnel(credentials, (err, result) => {
        console.log(result)
        if (result.host) {
            neoCredentials = result;
            setupConnectionTest();
        } else {
            throw err;
        }

    })
}

function setupConnectionTest() {
    let db = __context.get("__db")
    let cuser = __context.get("__cuser");
    let hanaPass = __context.get("__hana_pass");
    migrationController.setupConnection(db, neoCredentials, cuser, hanaPass) 
    getAllDUsTest()
}

function getAllDUsTest() {
    migrationController.getAllDeliveryUnits((err, units) => {
        // console.log(units)
        if (units.length > 0) {
            const du = {"ach":"","caption":"","lastUpdate":"2021-06-18 11:47:41.1100000","name":"MIGR_TOOLS","ppmsID":"","responsible":"","sp_PPMS_ID":"","vendor":"migration.sap.com","version":"","version_patch":"","version_sp":""};
            migrationController.copyAllFilesForDu(du, (err) => {
                if (err) {
                    throw err;
                } else {
                    callback.callAssertTrue(true);
                    console.log("MIGRATION DONE!")
                }
            })
        }
    })
}


openTunnelTest();