@istest
public class FileUploadController_Test {
     @istest
    public static void test_dwnld(){
         string Obj = 'Account';
        string label = 'Account';
        string Fields = 'Id';
        //List<Object> fieldList1 = (List<Object>)JSON.deserializeUntyped('[{"field":"phone","object":"account"},{"field":"name","object":"account"}]');
        //Create Account
       list<string> objlist = new list<string>();
        objlist.add(obj);
        Account acct = new Account(Name='TEST_ACCT');
        insert acct;
         String jSONSObject = '[{"field":"phone","object":"Account","csvHeadName" :"Account","fieldNmae":"phone"}]';
       //List<Object> fieldList = (List<Object>)JSON.deserializeUntyped(jSONSObject);
       // fieldList.add(Fields);
        
        //Create contentVersion
                
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'TestDocument.CSV';
        cv.VersionData = Blob.valueOf('Account'+'\n'+'Test Content 1');
        cv.IsMajorVersion = true;
         insert cv;
        
      //  system.debug('line 32::'+conlist.size());
                //Get Content Version
        List<ContentVersion> cvList = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        system.debug('size::'+cvList.size());
        //System.assertEquals(cvList.size(), 1);
        system.debug('ContentVersionID : ' + cvList[0].Id);
        
       //create ContentDocumentLink  record 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = acct.id;
        cdl.ContentDocumentId = cvList[0].ContentDocumentId;
        cdl.shareType = 'V';
        insert cdl;  
         System.assertEquals(cdl.ContentDocumentId,cvList[0].ContentDocumentId);
         FileUploadController.loadData(cvList[0].ContentDocumentId);
        FileUploadController.getObjList();
        FileUploadController.getObjectAPINameToLabel();
        FileUploadController.getSObjectFields('Account');
        FileUploadController.saveCsvFile(cvList[0].ContentDocumentId,'Account',jSONSObject);
       
    }
 
}