/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-10-2022
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class FileUploadController {
    
    @AuraEnabled
    public static List<String> loadData( Id contentDocumentId) {
        
        String strMessage;
        List<String> myCsvHead=new List<String>();
        List<String> testCsvHead=new List<String>();
        List < Contact > contactList = new List < Contact >();
        
        if ( contentDocumentId != null ) {
            
            ContentVersion contentVersionObj = [ SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId ];
            List < String > records = contentVersionObj.VersionData.toString().split( '\n' );
            System.debug(' line 22 records====>'+records);
            String str = records[0];
            str=str.replaceAll('\r','');
            
            System.debug('str=====>'+str);
            //Removing the Header
            
            myCsvHead.add(str);
            testCsvHead.addAll(str.split(','));
            // System.debug('record[1][1]'+records[1][1]);
            System.debug('myCsvHead'+myCsvHead);
            System.debug(' testCsvHead '+ testCsvHead.indexOf('Ak'));
            records.remove(0);
            
            /* for ( String record : records ) {

if ( record != null ) {

Contact objContact = new Contact();
List < String > row = record.split( ',' );
objContact.FirstName = row[ 0 ];
objContact.LastName = row[ 1 ];
objContact.Email = row[ 2 ];
contactList.add( objContact );

}

}

try {    

if ( contactList.size() > 0 ) {

Database.DeleteResult deleteResult = Database.delete( contentDocumentId, true );
insert contactList;
strMessage = 'Records loaded successfully';

}

}
catch ( Exception e ) {

strMessage = 'Some error occured. Please reach out to your System Admin';
system.debug( e.getMessage() );

} 
*/
        }
        
        return myCsvHead;
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getObjList(){
       /* System.debug('getOnbj Called');
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        List<String> objNameList=new List<String>(globalDescribe.keyset());
        System.debug('all objects:'+globalDescribe.keyset());
        //System.debug('all objects:'+objNameList.sort());
        return objNameList ;*/
        
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
        Set<String> standardObjects = new Set<String>();
        Set<String> customObjects = new Set<String>();
        for(Schema.SObjectType d : gd.values())
        {
            Schema.DescribeSObjectResult ds = d.getDescribe();
            if(!ds.isCreateable())
                continue;
            if(ds.isCustom() == false && ds.getRecordTypeInfos().size() > 0)
                standardObjects.add(ds.getName());
            else if(ds.isCustom())
                customObjects.add(ds.getName());
        }
        List<String> sortedList=new List<String>();
        standardObjects.AddAll(customObjects);
        System.debug('standardObjects===>'+standardObjects);
        //System.debug('standardObjects sorted===>'+standardObjects.sort());
        
        list<String> sortedNames = new List<String>(standardObjects);
        sortedNames.sort();
        System.debug('sortedNames'+sortedNames);

      return sortedNames;
        
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
         	 
            objectAPINameToLabelMap.put(currentSObjectResult.getName(), currentSObjectResult.getLabel());
        }
       /* for(String a: objectAPINameToLabelMap.keyset()){
            
        }*/
         
         // * Returning the map
        return objectAPINameToLabelMap;
    }
    
    @AuraEnabled
    public static List<String> getSObjectFields(String sObjectName){
        System.debug('sObjectName'+sObjectName);
        List<String> fieldNames=new List<String>();
        Map<String,Schema.SObjectType> sObjectMap=Schema.getGlobalDescribe();
        Schema.SObjectType sObjectTypeInstance=sObjectMap.get(sObjectName);
        System.debug('sObjectTypeInstance '+sObjectTypeInstance);
        if(sObjectTypeInstance!=null){
            Map<String,Schema.SObjectField> fieldMap=sObjectTypeInstance.getDescribe().fields.getMap();
            for(Schema.SObjectField field: fieldMap.values()) {
                Schema.DescribeFieldResult fieldResult = field.getDescribe();
                if(fieldResult.isAccessible()) {
                    fieldNames.add(fieldResult.getName());
                }
            }
        }
        System.debug('fieldNames'+fieldNames);
        return fieldNames;
        
    }
    
    @AuraEnabled
    public static String saveCsvFile(Id contentDocumentId,String sObjectName,String jSONSObject ){
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
        system.debug('line 176 ::'+fieldList);
        
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(sObjectName);
        for(Object obj:fieldList){
            Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(obj));
            system.debug('line 181 :'+m);
            Integer lenMap=m.size();
            system.debug('line 182 :'+lenMap);
            for(Integer i=0;i<lenMap;i++){
                
                csvHeadFeildMap.put(String.valueOf(m.get('csvHeadName')),String.valueOf(m.get('fieldNmae')));
                
                
            }
            system.debug('value  189 ::'+csvHeadFeildMap.values());

            System.debug('csvHeadFeildMap. ' +csvHeadFeildMap);
            System.debug('m======>'+m);
            Map<String, Object> fieldMap = (Map<String, Object>)(obj);
            System.debug('fieldMap keys   '+fieldMap.keySet());
            System.debug('fieldMap   values '+fieldMap.values());
            // System.debug(obj.csvHeadName);
        }
        
        if ( contentDocumentId != null ){
            ContentVersion contentVersionObj = [ SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId ];
            List <String> records = contentVersionObj.VersionData.toString().split( '\n' );
            System.debug('records====>'+records);
            System.debug('records[0] '+records[0]);
            System.debug('records[0] '+records[0].split(','));
            String str = records[0];
            str=str.replaceAll('\r','');
            
            myCsvHead.addAll(str.split(','));
            
            System.debug('myCsvHead'+myCsvHead);
            
            
            for( String headName: myCsvHead){
                csvHeadColumnMap.put(headName,myCsvHead.indexOf(headName));
            }
            System.debug('csvHeadColumnMap====>'+csvHeadColumnMap.KeySet());
            System.debug('csvHeadColumnMap====>'+csvHeadColumnMap.values());
            system.debug('line 216::'+records);
            
             records.remove(0);
            
            system.debug('line 217 ::'+records);
            
            for(String record : records){
                if(record!=null){
                    SObject newSobject = targetType.newSObject();
                    system.debug('line 228 :'+newSobject);
                   record=record.replaceAll('\r','');
                    List < String > row = record.split( ',' );
                    system.debug('line 231 :'+row);
                    system.debug('line  232 :'+csvHeadFeildMap.keySet());
                    system.debug('line 234 :'+myCsvHead);
                    Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();
                    for(String csvHeadKey:csvHeadFeildMap.keySet()){
                         system.debug('line 236 :'+csvHeadKey);
                         String key=csvHeadFeildMap.get(csvHeadKey);
                        Integer index=myCsvHead.indexOf(csvHeadKey);
                        system.debug('index ::'+index);
                        if(key!=null)
                        {
                        Schema.DisplayType valueType = targetFields.get(key).getDescribe().getType();
                        
                        system.debug('line 241 :: '+valueType);
                         String svalue = row[index];
                            system.debug('line 243 :'+svalue);
                       // String svalue=(string)value;
                       
                        System.debug('field Name===> '+key+' valueType ===> '+valueType);                        
                        if(valueType != Schema.DisplayType.String){
                            
                            if (valueType == Schema.DisplayType.Date)
                            {    
                                String month;
                                String year;
                                String day;
                                year = svalue.substring(0,4);
                                month = svalue.substring(5,7);
                                day = svalue.substring(8,10);
                                Date myDate = Date.newInstance(integer.valueOf(year),integer.valueOf(month),integer.valueOf(day));
                                newSobject.put(key, myDate);
                            } else if(valueType == Schema.DisplayType.DateTime)
                            {
                                svalue = svalue.replace('T',' ');
                                svalue = svalue.replace('Z','');
                                newSobject.put(key, DateTime.valueOfGmt(svalue));
                            } 
                            else if (valueType == Schema.DisplayType.Percent || valueType == Schema.DisplayType.Currency)
                                newSobject.put(key, svalue == '' ? null : Decimal.valueOf(svalue)); 
                            else if (valueType == Schema.DisplayType.Double)
                                newSobject.put(key, svalue == '' ? null : Double.valueOf(svalue));
                            else if (valueType == Schema.DisplayType.Integer)
                                newSobject.put(key, Integer.valueOf(svalue));
                            else if (valueType == Schema.DisplayType.Base64)
                                newSobject.put(key, Blob.valueOf(svalue));
                            
                            else
                                newSobject.put(key, svalue);
                        }else{
                            newSobject.put(key,svalue);
                        } 
                        
                       // newSobject.put(key,svalue);
                       
                    }
                    }
                     System.debug('newSobject '+newSobject);
                    newSobjectList.add(newSobject);
                }
                
            }
            
             System.debug('newSobjectList++++++++++===> '+newSobjectList);
            
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