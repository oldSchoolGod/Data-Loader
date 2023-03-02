public class DeleteController {
    
    @AuraEnabled
    public static String loadData( Id contentDocumentId) {
        system.debug('content DocumentId : '+contentDocumentId);
        String strMessage;
        String myCsvHead;
        List<String> testCsvHead=new List<String>();        
        if ( contentDocumentId != null ) {
            ContentVersion contentVersionObj = [ SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId ];
            List < String > records = contentVersionObj.VersionData.toString().split( '\n' );
            system.debug('line 12::'+records);
            records.remove(0);
            List <String> SobjectIds = new List<String>();
            for (Integer i=0;i<records.size();i++) {
                System.debug('record '+records[i]);
                // list<String> columnValues = new list<String>();
                // columnValues = records[i].split(',');
                //Id currentId = Id.valueOf(columnValues[0]);
                // SobjectIds.add(String.valueOf(columnValues[0]));
                
                string CurrentId = (records[i].deleteWhitespace()); 
                if(CurrentId != ''){
                SobjectIds.add((CurrentId));
                }
            }

            if(SobjectIds.size() > 0){
                List<Database.DeleteResult> dr = Database.delete(SobjectIds, false);
                 myCsvHead = 'Success';
                // List<Database.DeleteResult> dr = database.delete(cntList);
            }
        }
        return myCsvHead;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getObjList(){
        System.debug('getOnbj Called');
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        List<String> objNameList=new List<String>(globalDescribe.keyset());
        System.debug('all objects:'+globalDescribe.keyset());
        return objNameList ;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String,String> getObjectAPINameToLabel(){
        // * Initializing Map
        Map<String, String> objectAPINameToLabelMap = new Map<String, String>();
        
        // * Getting all sObjects metadata
        Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe();
        System.debug('globalDescribeMap '+globalDescribeMap);
        System.debug('gglobalDescribeMap.keySet() '+globalDescribeMap.keySet());
        // * Processing each sObject one by one
        
        for(String globalDescribeKey : globalDescribeMap.keySet()) {
            
            // * Getting the current sObject type
            System.debug('globalDescribeKey '+globalDescribeKey);
            Schema.SObjectType currentSObjectType = globalDescribeMap.get(globalDescribeKey);
            System.debug('currentSObjectType '+currentSObjectType);
            // * Getting the current sObject description result from sObject Type
            Schema.DescribeSObjectResult currentSObjectResult = currentSObjectType.getDescribe();
            System.debug('currentSObjectResult ' +currentSObjectResult);
            // * Getting the API name and value of current sObject and adding it to the map
            // System.debug(currentSObjectResult.getName().sort());
            objectAPINameToLabelMap.put(currentSObjectResult.getName(), currentSObjectResult.getLabel());
        }
        
        // * Returning the map
        return objectAPINameToLabelMap;
    }
    @AuraEnabled
    public static String saveCsvFile(Id contentDocumentId,String sObjectName,String jSONSObject){
        Map<String,String>csvHeadFeildMap=new Map<String,String>();
        Map<String,Integer> csvHeadColumnMap=new Map<String,Integer>();
        List<SObject> newSobjectList = new List<SObject>();
        System.debug('contentDocumentId '+contentDocumentId);
        System.debug('sObjectName'+ sObjectName);
        System.debug('jSONSObject '+jSONSObject);
        List<String> myCsvHead=new List<String>();
        //Map<String, Object> lastMap = (Map<String, Object>) JSON.deserializeUntyped(jSONSObject);
        // list<map<string,object>> listMap = (list<map<string,object>>)JSON.deserializeUntyped(jSONSObject);
        // system.debug('listMap : '+listMap);
        List<Object> fieldList = (List<Object>)JSON.deserializeUntyped(jSONSObject);
        
        
        System.debug('fieldList '+fieldList);
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(sObjectName);
        for(Object obj:fieldList){
            Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(Obj));
            Integer lenMap=m.size();
            for(Integer i=0;i<lenMap;i++){
                
                csvHeadFeildMap.put(String.valueOf(m.get('csvHeadName')),String.valueOf(m.get('fieldNmae')));
                
            }
            System.debug('csvHeadFeildMap. ' +csvHeadFeildMap);
            System.debug('m======>'+m);
            Map<String, Object> fieldMap = (Map<String, Object>)(obj);
            System.debug('fieldMap keys   '+fieldMap.keySet());
            System.debug('fieldMap   values '+fieldMap.values());
            // System.debug(obj.csvHeadName);
        }
        
        if ( contentDocumentId != null ){
            ContentVersion contentVersionObj = [ SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId ];
            List < String > records = contentVersionObj.VersionData.toString().split( '\n' );
            System.debug('records====>'+records);
            System.debug('records[0] '+records[0]);
            System.debug('records[0] '+records[0].split(','));
            String str = records[0];
            str=str.replaceAll('\r','');
            
            myCsvHead.addAll(str.split(','));
            
            System.debug('myCsvHead'+myCsvHead);
            System.debug('myCsvHead'+myCsvHead.indexOf('Account.Name'));
            System.debug('myCsvHead'+myCsvHead.indexOf('AccountId'));
            System.debug('myCsvHead'+myCsvHead.indexOf('Ak'));
            System.debug('myCsvHead'+myCsvHead.indexOf('Contact Id'));
            
            
            for( String headName: myCsvHead){
                csvHeadColumnMap.put(headName,myCsvHead.indexOf(headName));
            }
            System.debug('csvHeadColumnMap====>'+csvHeadColumnMap.KeySet());
            System.debug('csvHeadColumnMap====>'+csvHeadColumnMap.values());
            
            for(String record : records){
                if(record!=null){
                    SObject newSobject = targetType.newSObject();
                    List < String > row = record.split( ',' );
                    system.debug('line 134:: '+row);
                    system.debug('line 135 ::'+csvHeadFeildMap.keySet());
                    for(String key:csvHeadFeildMap.keySet()){
                        system.debug('line 137::'+csvHeadFeildMap.get(key));
                        if(csvHeadFeildMap.get(key)!=null)
                        {
                        newSobject.put(csvHeadFeildMap.get(key),row[myCsvHead.indexOf(key)]);
                        }
                    }
                    newSobjectList.add(newSobject);
                }
                System.debug('newSobjectList '+newSobjectList);
            }
            
        }
        
        try
        {
            upsert newSobjectList;
            System.debug(' ::Success:: ');
            return 'Sucess';
        } catch(Exception e)
        {
            System.debug('Error in Update : '+e.getMessage());
            return ''+e.getMessage();
        }
        
        //return true;
    }
}