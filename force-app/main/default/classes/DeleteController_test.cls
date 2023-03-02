@istest
public class DeleteController_test {
     @istest
    public static void test_dwnld(){
         string Obj = 'Account';
        string label = 'Account';
        string Fields = 'Id';
        //List<Object> fieldList1 = (List<Object>)JSON.deserializeUntyped('[{"field":"phone","object":"account"},{"field":"name","object":"account"}]');
        //Create Account
        Account acct = new Account(Name='TEST_ACCT');
        insert acct;
         String jSONSObject = '[{"field":"phone","object":"account"}]';
       //List<Object> fieldList = (List<Object>)JSON.deserializeUntyped(jSONSObject);
       // fieldList.add(Fields);
        
        //Create contentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'TestDocument.pdf';
        cv.VersionData = Blob.valueOf('Test Content');
        cv.IsMajorVersion = true;
        Insert cv;
        
        
        //Get Content Version
        List<ContentVersion> cvList = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        System.assertEquals(cvList.size(), 1);
        system.debug('ContentVersionID : ' + cvList[0].Id);
        
        //create ContentDocumentLink  record 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = acct.id;
        cdl.ContentDocumentId = cvList[0].ContentDocumentId;
        cdl.shareType = 'V';
        insert cdl;  
         System.assertEquals(cdl.ContentDocumentId,cvList[0].ContentDocumentId);
         DeleteController.loadData(cvList[0].ContentDocumentId);
        DeleteController.getObjList();
        DeleteController.getObjectAPINameToLabel();
        DeleteController.saveCsvFile(cvList[0].ContentDocumentId,'Account',jSONSObject);
       
    }
  
}