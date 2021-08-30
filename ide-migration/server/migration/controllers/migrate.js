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

    getAllDeliveryUnits(completion) {
        
        if (!this.repo) {
            
            return completion("Repository not initialized", null);       
        }
        
        try {
            this.repo.getAllDeliveryUnits(function(error, result){
                completion(null, result);
            });
        } catch (error) {
            completion(error)
        } 
    }

    copyAllFilesForDu(du, workspaceName, completion) {
        if (!this.repo) {
            return completion("Repository not initialized", null);
        }

        let context = {};
        try {
            this.repo.getAllFilesForDu(context, du, (err, files, packages) => {
                console.log("Files list: " + JSON.stringify(files));
                this.dumpSourceFiles(workspaceName, files, du, function(err){
                    completion(err);
                })
            })
        } catch (error) {
            console.error(error)
            completion(error);
        } 
    }

    dumpSourceFiles(workspaceName, lists, du, callback) {
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
        callback(null);
    }

}

module.exports = MigrationController;


