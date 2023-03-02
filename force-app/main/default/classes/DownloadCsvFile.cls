public class DownloadCsvFile {
    @AuraEnabled
    public static List<sObject> getSObjectData(String Obj, Object Fields){
        String f = String.valueOf(Fields);
        system.Debug('furrrrrrrr    ' + f);
        String q = 'SELECT ' + f + ' From ' + Obj;
        System.debug('Query  ' + q);
        List<sObject> returnData = database.query(q);
        system.debug('this is the data ::'+returnData);
        return returnData;
    }
    
    @AuraEnabled
    public static Map<String, String> getLabels(String Obj, Object Fields){
        system.debug('Obj   ' + Obj);
        system.debug('Fields   ' + Fields);
        String fld = String.valueOf(Fields);
        System.debug('@@@@@@@@@@@' + fld);
        Map<String, String> objHeader = new Map<String, String>();
        String[] extractLabel = fld.split(',');
        system.debug('###########' +extractLabel);
        for(String l : extractLabel){
            String Label = Schema.getGlobalDescribe().get(Obj).getDescribe().fields.getMap().get(l).getDescribe().getLabel();
            objHeader.put(l,Label);
        }
        return objHeader; 
    }
}