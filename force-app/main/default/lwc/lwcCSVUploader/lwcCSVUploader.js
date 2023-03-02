import { LightningElement ,track, wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import loadData from '@salesforce/apex/FileUploadController.loadData';
import  getObjectAPINameToLabel from '@salesforce/apex/FileUploadController.getObjectAPINameToLabel';
import getSObjectFields from '@salesforce/apex/FileUploadController.getSObjectFields';
import saveCsvFile from '@salesforce/apex/FileUploadController.saveCsvFile';

export default class FileUpload extends LightningElement {

  error;
  isLoaded = false;
  beforeUplode=false;
  selectObj=true;
  isObjectSelected=false;
  @track showMap=false;
  @track items = []; //this will hold key, value pair (csv header list)
  @track fieldNameList=[];//list of field names(selected Sobject field api_name and label as key vale pair)
  @track value = ''; //initialize combo box value
  @track chosenValue = '';
  @track chosenFieldNameValue='';
  @track chosenSobj='';
  @track prevChosenSobj='';
  @track prevFileName='';
  @track recordMap = [];//mapped list 
  @track objName = [];// contains object api_name and lable as key and value pair
  @track objNameTemp = [];
  @track selectedFileName='';
  @track uplodeData=[];// contains the uploded file data
  
  // grtting all sObject api_name and lable in wire service
  @wire(getObjectAPINameToLabel)
    getObjListName(response){
        console.log("IN wire sevice");
        let data=response.data;
        let error=response.error;
        //console.log(typeof data);
      if(data){
         // console.log("data"); 
         // console.log(data);
          this.objName=[];
          try{
            //console.log("@@@@@@@@@@@@@@@@",data.keys());
          }catch{

          }
          for(var key in data ){
              this.objName.push({value:data[key],label:key});
              this.objNameTemp.push({value:data[key],label:key});
             // this.mapSort1 = new Map([... this.objNameTemp].sort((a, b) => b[1] - a[1]));
             // alert('sort'+JSON.stringify(mapSort1));
              //console.log('sort >>>'+JSON.stringify(this.mapSort1));
          }
         
           // console.log(JSON.stringify(this.objName));
        }else if(error){
            console.log("error");
            console.log(error);
        }
    }

    
  get acceptedFormats() {
      return ['.csv'];
  }
  
  uploadFileHandler( event ) {
      this.isLoaded = true;
      const uploadedFiles = event.detail.files;
      this.uplodeData=uploadedFiles;
      console.log(" this.uplodeData ", JSON.stringify(this.uplodeData));
      //alert(JSON.stringify(uploadedFiles));
      console.log("uplodeFiles",uploadedFiles);
      try{
        console.log("file Name===> "+uploadedFiles[0].name);
      this.selectedFileName=uploadedFiles[0].name;
      }catch(error){
          console.log(error);
      } 
      if(this.prevFileName=='' || this.prevFileName!=uploadedFiles[0].name){
      this.prevFileName=uploadedFiles[0].name;
          loadData( { contentDocumentId : uploadedFiles[0].documentId } )
      .then( result => {
          console.log("In side result");
          this.isLoaded = false;
          window.console.log('result ===> '+result);
          console.log('result[i]$$$$$$',result.length);
          const headList=result[0].split(',');
          console.log("headList======>",headList);
          console.log("headList length======>",headList.length);
          console.log("headList[i]======>",headList[0]);
          this.items=[];
          for(let i=0;i<headList.length;i++){
            this.items = [...this.items ,{value: headList[i], label: headList[i]} ];  
          } 
          
         // console.log("items=======>>>>>>",this.items);
          // this.isObjectSelected=true;
          // this.beforeUplode=false;
          
          //this.strMessage = result;
          // this.dispatchEvent(
          //     new ShowToastEvent( {
          //         title: 'Success',
          //         message: result,
          //         variant: result.includes("success") ? 'success' : 'error',
          //         mode: 'sticky'
          //     } ),
          // );

      })
      .catch( error => {
          this.isLoaded = false;
          this.error = error;
          this.dispatchEvent(
              new ShowToastEvent( {
                  title: 'Error!!',
                  message: JSON.stringify( error ),
                  variant: 'error',
                  mode: 'sticky'
              } ),
          );     
        
      } )
      }else{
      this.isLoaded = false;
      }
      
  }

  get roleOptions() {
    return this.items;
  }
    
  get objFieldNameOptions(){
  return this.fieldNameList;
}


handleChange(event) {
  // Get the string of the "value" attribute on the selected option
  const selectedOption = event.detail.value;
  console.log('selected value=' + selectedOption);
  this.chosenValue = selectedOption;
}

getSelectedObj(event) {
  // Get the string of the "value" attribute on the selected option
  const selectedOption = event.currentTarget.dataset.record;
 //alert( selectedOption);
 var divblock = this.template.querySelector('[data-id="'+selectedOption+'"]');
 //alert(divblock);
 if(divblock != null){
  divblock.className='selected';
 }
  //this.template.querySelector('.chooseobject').classList.remove('Active');
  this.chosenSobj = selectedOption;
 /* console.log('this.chosenSobj  ', this.chosenSobj);
  console.log('this.prevChosenSobj ' ,this.prevChosenSobj);
  console.log('this.fieldNameList' , this.fieldNameList);*/
  if(this.prevChosenSobj=='' || this.prevChosenSobj!=this.chosenSobj){
    this.prevChosenSobj=this.chosenSobj;
    getSObjectFields({sObjectName:this.chosenSobj})
    .then(result=>{
        console.log("SobjFieldList",result);
        console.log(result.length);
        console.log(result[0]);
        this.fieldNameList=[];
        for(let i=0;i<result.length;i++){
        this.fieldNameList = [...this.fieldNameList ,{value: result[i], label: result[i]} ];  
      }
      console.log("fieldNameList======>",this.fieldNameList);

    })
    .catch(error=>{
        console.log("error");
    })
  }
  
}

getSelectedObjFieldNames(event){
  const selectedOption = event.detail.value;
  console.log('selected value=' + selectedOption);
  this.chosenFieldNameValue=selectedOption;
}
//this value will be shown as selected value of combobox item
get selectedValue(){
  return this.chosenValue;
}
get selectedFieldValue(){
return this.chosenFieldNameValue;
}
handleSeach(event){
 
  let getval = event.target.value;

 

  let objlist = [];
  for(let key in this.objName ){
   // console.log('objName@@'+JSON.stringify(this.objName[key].label));
    if(this.objName[key].label.includes(getval)){
   // console.log('key.includes(getval)@@'+key.includes(getval));
      objlist.push({label:this.objName[key].label,value:this.objName[key].value});
     // console.log('obj list after search :'+JSON.stringify(objlist));
    }
    this.objNameTemp = objlist != null ?  objlist :  JSON.stringify(this.objName);
    //console.log('search obj@@'+ JSON.stringify(this.objName));
  }
  
}
ShowCustumObject(event){
  let customObject = [];
  for(let key in this.objName ){
    //console.log('data in objlist'+JSON.stringify(this.objName[key].label))
    if(this.objName[key].label.endsWith("__c")){
      //console.log('chek enter in if '+key.endsWith("__c"))
      customObject.push({label:this.objName[key].label,value:this.objName[key].value}); 
      //console.log('custom object >>>'+JSON.stringify(customObject));
    }
    this.objNameTemp = customObject != null ?  customObject :  JSON.stringify(this.objName);
   // console.log('search obj@@'+ JSON.stringify(this.objName));
  }
}
ShowStandardObject(event){
  let standardObject = [];
  for(let key in this.objName ){
    if(!(this.objName[key].label.endsWith("__c"))){
    //  console.log('chek enter in if '+key.endsWith("__c"))
      standardObject.push({label:this.objName[key].label,value:this.objName[key].value}); 
     // console.log('std object >>>'+JSON.stringify(standardObject));
    }
    this.objNameTemp = standardObject != null ?  standardObject :  JSON.stringify(this.objName);
  }
}
SHowAllObject(event){
  this.objNameTemp = this.objName;
}
addRow(event){
let currentCsvHead=this.chosenValue;
let currentFeildName=this.chosenFieldNameValue;
if(currentCsvHead!=null && currentFeildName!=null ){
  this.showMap=true;
}
//console.log("currentCsvHead    " + currentCsvHead +"currentFeildName" +currentFeildName);
//console.log("this.recordMap.length  ",this.recordMap.length);
let lastTaskIndex;
let lastTaskId;
let lastIdInInteger;
if(this.recordMap.length==0){
  lastIdInInteger =0;
}else{
  lastTaskIndex=this.recordMap.length-1;
  lastTaskId=this.recordMap[lastTaskIndex].id;
  lastIdInInteger = parseInt(lastTaskId, 10);
}

//console.log("lastTaskIndex",lastTaskIndex);
//console.log("lastTaskId",lastTaskId);
//console.log("lastIdInInteger",lastIdInInteger);
this.recordMap.push({
  id:lastIdInInteger+1,
  csvHeadName:this.chosenValue,
  fieldNmae:this.chosenFieldNameValue

});
}

saveRecord(event){
   // console.log("saveRecord");
   // console.log("map to send",JSON.stringify(this.recordMap));
   // console.log("typeof this.recordMap " ,typeof(this.recordMap));
    saveCsvFile({contentDocumentId : this.uplodeData[0].documentId,sObjectName:this.chosenSobj,jSONSObject :JSON.stringify(this.recordMap)})
    .then((result)=>{
     // console.log("In save Record");
     // console.log("result ",result);
      const evt = new ShowToastEvent({
        title: 'Toast Success',
        message: 'Opearation sucessful',
        variant: 'success',
        mode: 'dismissable'
    });
    this.dispatchEvent(evt);
    const custEvent = new CustomEvent(
      'callpasstoparent', {
          detail: true 
      });
  this.dispatchEvent(custEvent);
    })
    .catch((error)=>{
 // console.log("error ",error);
  const evt = new ShowToastEvent({
    title: 'Toast Error',
    message: 'Some unexpected error',
    variant: 'error',
    mode: 'dismissable'
});
this.dispatchEvent(evt);
    })  
}

goToFileUplode(event){
    console.log("next button");
    if(this.chosenSobj!=''){
    this.selectObj=false;
    this.template.querySelector('.upload_file').classList.add('Active');
    this.template.querySelector('.chooseobject').classList.remove('Active');
    this.beforeUplode=true;
    }else{
    const evt = new ShowToastEvent({
      title: 'Toast Warning',
      message: 'Select Sobject!',
      variant: 'warning',
      mode: 'dismissable'
  });
  this.dispatchEvent(evt);
    }
    
}

goBackToSelectObj(event){
  //console.log("goBackToSelectObj");
  //console.log("this.selectObj  "+ this.chosenSobj);
this.selectObj=true;
this.template.querySelector('.upload_file').classList.remove('Active');
    this.template.querySelector('.chooseobject').classList.add('Active');
this.beforeUplode=false;
//this.chosenSobj='';
//  this.fieldNameList=[];
//  this.uplodeData=[];
//  this.selectedFieldValue='';

}

goBackToUplodeFile(event){
this.isObjectSelected=false;

          this.beforeUplode=true;
        //  this.items =[];
}

goToMappingStep(event){

  //console.log("this.uplodeData  "+this.uplodeData);

  if(this.uplodeData.length>0){
  this.isObjectSelected=true;
  this.template.querySelector('.upload_file').classList.remove('Active');
  this.template.querySelector('.Map_field').classList.add('Active');
  this.beforeUplode=false;
  }else{
  
  console.log("In Else Part");
  const evt = new ShowToastEvent({
    title: 'Toast Warning',
    message: 'Select File!',
    variant: 'warning',
    mode: 'dismissable'
});
this.dispatchEvent(evt);
  
  }
  

}

deleteRow(event){
//  alert(event.target);
//  alert(event.target.name);
  //console.log("event.target",event.traget);
  //console.log("event.target.name",event.target.getAttribute('name'));
  let recordMap=this.recordMap;
  let rowToDelIndex;
  let rowIdToDel=event.target.name;
  for(let i=0;i<recordMap.length;i++){
  if(rowIdToDel===recordMap[i].id){
    rowToDelIndex=i;
}
}
if(rowToDelIndex!=null){
recordMap.splice(rowToDelIndex,1);
}else{
console.log("unable to Delete row");
}


}


}