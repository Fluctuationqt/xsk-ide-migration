const exec = require("core/v4/exec");
const config = require("core/v4/configurations");
const canonicalPrefix = "/usr/local/tomcat/target/dirigible/repository/root/users/dirigible/workspace/"

const neoPath = __context.get("__neo_path") || config.get("user.dir") + "/target/dirigible/resources-neo-sdk/neo-migration.sh";
const neoClientPath = __context.get("__neo_client_path") || config.get("user.dir") + "/target/dirigible/resources-neo-sdk/neo-sdk/tools/neo.sh";

class TunnelController {

    openTunnel(credentials, completion) {
        const account = credentials.account;
        const host = credentials.host;
        const user = credentials.user;
        const password = credentials.password;
        const db = credentials.db;

        const script = `bash ${neoPath} -a "${account}" -h "${host}" -u "${user}" -p "${password}" -i "${db}"`;
        
        const response = exec.exec(script, {"NEO_CLIENT_PATH": neoClientPath});

        const neoOutput = JSON.parse(response.substring(response.indexOf("{")));

        if (neoOutput.errorMsg) {
          throw "[NEO CLIENT ERROR]" + neoOutput.errorMsg
        }
        completion(null, neoOutput);
    }
}

module.exports = TunnelController;
