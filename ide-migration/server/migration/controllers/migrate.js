let HanaRepository = require('ide-migration/server/migration/repository/hana-repository');
let workspaceManager = require("platform/v4/workspace");
var database = require("db/v4/database");


class MigrationController {

    connection = null;
    repo = null;

    setupConnection(databaseName, databaseUser, databaseUserPassword) {
            database.createDataSource(databaseName, "com.sap.db.jdbc.Driver", "jdbc:sap://localhost:30015/", databaseUser, databaseUserPassword, null);

            this.connection = database.getConnection('dynamic', databaseName);
            this.repo = new HanaRepository(this.connection);
    }

    getAllDeliveryUnits() {
        if (!this.repo) {
            throw new Error("Repository not initialized");
        }
        
            return this.repo.getAllDeliveryUnits();
    }

    copyAllFilesForDu(du, workspaceName) {
        if (!this.repo) {
            throw new Error("Repository not initialized");
        }

        let context = {};
            const filesAndPackagesObject = this.repo.getAllFilesForDu(context, du)
            console.log("Files list: " + JSON.stringify(filesAndPackagesObject.files));
            this.dumpSourceFiles(workspaceName, filesAndPackagesObject.files, du)
    }

    dumpSourceFiles(workspaceName, lists, du) {
        let workspace;
        if (!workspaceName) {
            workspace = workspaceManager.getWorkspace(du.name)
            if (!workspace) {
                workspaceManager.createWorkspace(du.name)
                workspace = workspaceManager.getWorkspace(du.name)
            }
        } 
        workspace = workspaceManager.getWorkspace(workspaceName);

        for(let i = 0; i < lists.length; i++) {
            const file = lists[i];
            let project = workspace.getProject(file.packageId)
            if (!project) {
                workspace.createProject(file.packageId)
                project = workspace.getProject(file.packageId)
            }
 
            let projectFile = project.createFile(file.RunLocation);
            projectFile.setContent(file._content);
        }
    }

}

module.exports = MigrationController;


