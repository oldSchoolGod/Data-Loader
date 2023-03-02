@istest
public class DownloadCsvFile_Test {
     @istest
    public static void test_dwnld(){
        string Obj = 'Account';
        string label = 'Account';
        string Fields = 'Id';
        
        
        
        DownloadCsvFile.getLabels(Obj,Fields);
         DownloadCsvFile.getSObjectData(Obj,Fields);
        DeleteController.getObjList();
        DeleteController.getObjectAPINameToLabel();
    }
  
}