import { LightningElement, wire, track } from 'lwc';
import Logos from '@salesforce/resourceUrl/Logo';
import hideheader from '@salesforce/resourceUrl/Hideheader';
import  { loadStyle } from "lightning/platformResourceLoader";
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFld from '@salesforce/schema/User.Email';
import getObjectAPINameToLabel from '@salesforce/apex/FileUploadController.getObjectAPINameToLabel';
import getSObjectFields from '@salesforce/apex/FileUploadController.getSObjectFields';
import getSObjectData from '@salesforce/apex/DownloadCsvFile.getSObjectData';
import getLabels from '@salesforce/apex/DownloadCsvFile.getLabels';
import loadData from '@salesforce/apex/DeleteController.loadData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { exportCSVFile } from 'c/utils'
const DELAY = 100;
export default class DataLoader extends LightningElement {
    connectedCallback(){
        loadStyle(this,hideheader)
        .then(result => {});
    }
    userId = Id;
    error;
    Logo1 = Logos + '/cloudprism2.png';
    currentUserName;
    uploadFiles = false;
    dropdown = false;
     activeSections = [];
    activeSectionMessage = '';
    @track DocumentModal= false;
    @track welcomeModalpopup = false;
    @track Poweredpopup = false;
    @track isModalOpen = false;
    @track showDownloadbtn = false;
    @track objName = [];
    @track screenOne = true;
    @track screenTwo = false;
    @track screenThree = false;
    @track selectedObject;
    @track selectedFields;
    @track selectedFileName;
    @track isModalOpenImport = false;
    @track ImportCsv = false;
    @track isModalOpenDelete = false;
    @track documentid = false;
    @track objName = [];// contains object api_name and lable as key and value pair
    @track objNameTemp = [];
    
    fieldNameList = [];
    headerData;
    ObjectData;
    openModal() {
        this.isModalOpen = true;
        this.screenOne = true;
        this.screenTwo = false;
        this.screenThree = false;
        
       
    }
    closeModal() {
        this.isModalOpen = false;
       
    }
    getSelectedObj(event){
        console.log('line no 58')
        //this.selectedObject
        this.selectedObject= event.currentTarget.dataset.record;
         // alert(  this.selectedObject);
        var divblock = this.template.querySelector('[data-id="'+ this.selectedObject+'"]');
            // alert(divblock);
        if(divblock != null){
         divblock.className='selected';
        //alert('hello ::'+divblock.className);
        
        }
        //alert('line 69');
        //this.template.querySelector('.chooseobject').classList.remove('Active');
  this.chosenSobj = this.selectedObject;
  //alert('this.chosenSobj::'+this.chosenSobj);
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
    nextForFieldsScreen() {
        //alert(this.selectedObject)
       // this.selectedObject = this.template.querySelector('select').value;
        this.template.querySelector('.fields').classList.add('Active');
        this.template.querySelector('.chooseobject').classList.remove('Active');

        this.screenOne = false;
        this.screenTwo = true;
        getSObjectFields({ sObjectName: this.selectedObject })
            .then(result => {
                for (let i = 0; i < result.length; i++) {
                    this.fieldNameList = [...this.fieldNameList, { label: result[i], value: result[i] }];
                }
            })
    }
    nextForDownloadScreen() {
        this.screenTwo = false;
        this.screenThree = true;
        this.exportObjectData();
        this.template.querySelector('.fields').classList.remove('Active');
        this.template.querySelector('.run').classList.add('Active');
    }
    getSelectedObjFieldNames(event) {
        let currentField = event.detail.value;
        //alert(currentField);
        this.selectedFields = currentField.toString();
        //alert('hii :: '+this.selectedFields);
    }
    get selectedFieldValue() {
        return this.chosenFieldNameValue;

    }
    get objFieldNameOptions() {
        return this.fieldNameList;
    }
    preForObjectsScreen() {
        this.template.querySelector('.chooseobject').classList.add('Active');
        this.template.querySelector('.fields').classList.remove('Active');
        this.screenOne = true;
        this.screenTwo = false;
        
    }
    preForFieldScreen() {
        this.template.querySelector('.fields').classList.add('Active');
        this.template.querySelector('.run').classList.remove('Active');
        this.screenTwo = true;
        this.screenThree = false;
       
    }
    /*----------*/
    @wire(getRecord, { recordId: Id, fields: [UserNameFld] })
    userDetails({ error, data }) {
        if (data) {
            this.currentUserName = data.fields.Email.value;

        } else if (error) {
            this.error = error;
        }
    }
    dropdown_content() {
        this.dropdown = true;
    }
    dataImport() {
        this.dropdown = false;
    }

    @wire(getObjectAPINameToLabel)
    getObjListName(response) {
        console.log("IN wire sevice");
        let data = response.data;
        let error = response.error;

        console.log(typeof data);
        if (data) {
            console.log("data");
            console.log(data);
            this.objName = [];
            for (var key in data) {
                this.objName.push({ label: data[key], value: key });
            }
        } else if (error) {

        }
    }

    get objNameOptions() {
        return this.objName;
    }

    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = evt.target.value;
        }
    }
    /*--Export to CSV File--*/
    exportObjectData() {
        getLabels({ Obj: this.selectedObject, Fields: this.selectedFields })
            .then(result => {
                this.headerData = result
                getSObjectData({ Obj: this.selectedObject, Fields: this.selectedFields })
                    .then(result => {
                        this.ObjectData = result
                        this.showDownloadbtn = true;
                    })
            })

    }
    downloadcsv() {
        this.isModalOpen = false;
        if(this.ObjectData.length == 0)
        {
           // alert('empty::'+this.ObjectData);
            this.showInfoToast();
        }
        if(this.ObjectData.length!= 0){
            exportCSVFile(this.headerData, this.ObjectData, this.selectedObject)
        }
    }
    
    openModalImport(){
        this.isModalOpenImport = true;
        this.ImportCsv = true;
    }
    closeModalImport(){
        this.isModalOpenImport = false;
        
    }

    handleClickDelete(){
        this.isModalOpenDelete = true;
    }
    closeModalDelete(){
        this.isModalOpenDelete = false;
    }
    
    /*--Upload Cdv File--*/
    @track uploadDocId=[];
    
    handleDelete(event){
        //alert('link::'+JSON.stringify(this.uploadDocId));
         var DocuumetIdvalue = this.uploadDocId[0].documentId;
         //alert('value:'+DocuumetIdvalue);
        //alert('uploadDocId : '+this.uploadDocId)
        loadData( { contentDocumentId : DocuumetIdvalue } )
             .then( result => {
                this.isLoaded = false;
               // alert('result : '+result)
               const evt = new ShowToastEvent({
                   title: 'Success',
                   message: 'Deleted  Successfully',
                   variant: 'success'
                  
               });
               this.dispatchEvent(evt);
            })
            this.isModalOpenDelete = false;
    }
    get acceptedFormats() {
        return ['.pdf', '.CSV'];
    }

    uploadFilehandle( event ) {
        this.isLoaded = true;
      const uploadedFiles = event.detail.files;
      this.uploadDocId=uploadedFiles;
      console.log(" this.uplodeData ", JSON.stringify(this.uploadDocId));
      //alert(JSON.stringify(uploadedFiles));
      console.log("uplodeFiles",uploadedFiles);
      try{
        console.log("file Name===> "+uploadedFiles[0].name);
      this.selectedFileName = uploadedFiles[0].name;
     // alert('selected fieldsname'+this.selectedFileName);
      }catch(error){
          console.log(error);
      } 
        /* this.isLoaded = true;
         const uploadedFiles = event.detail.files;
         this.uplodeData=uploadedFiles;
         this.uploadDocId = uploadedFiles[0].documentid;
         console
         if(this.uploadDocId !=''){
            this.documentid = true;
         }*/
    }

    handelCallFromChild(event){
       // alert('from Child '+event.detail);
        if(event.detail){
            this.closeModalImport();
        }
     }
     @wire(getObjectAPINameToLabel)
    getObjListName(response){
        console.log("IN wire sevice");
        let data=response.data;
        let error=response.error;
        console.log(typeof data);
      if(data){
          console.log("data");
          console.log(data);
          this.objName=[];
          try{
            console.log("@@@@@@@@@@@@@@@@",data.keys());
          }catch{

          }
          for(var key in data ){
              this.objName.push({value:data[key],label:key});
              this.objNameTemp.push({value:data[key],label:key});
          }
            //console.log(JSON.stringify(this.objName));
        }else if(error){
            console.log("error");
            console.log(error);
        }
    }
     handleSeach(event){
        let getval = event.target.value;
        let objlist = [];
        //alert('hello'+ getval);
      /*  this.objName.forEach(element => {
          if(element.contains(getval)){
            objlist.push(element);
          }
        });*/
        for(let key in this.objName ){
         // console.log('objName@@'+JSON.stringify(this.objName[key].label));
          if(this.objName[key].label.includes(getval)){
         // console.log('key.includes(getval)@@'+key.includes(getval));
            objlist.push({value:this.objName[key].label,label:this.objName[key].value});
            //console.log('obj list after search :'+JSON.stringify(objlist));
          }
          this.objNameTemp = objlist != null ?  objlist :  JSON.stringify(this.objName);
         // console.log('search obj@@'+ JSON.stringify(this.objName));
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
        //c/projectManagementToolAplications
        
        //alert('this is standarobhj::'+this.objName);
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
      showInfoToast() {
        const evt = new ShowToastEvent({
            title: 'Toast Info',
            message: 'the fields that you selected had no data',
            variant: 'info',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    welcomebody()
    {
        
         this.welcomeModalpopup = true;
        this.DocumentModal= false;
        this.Poweredpopup =false;
      
    }
    DcocumentBody()
    {
        this.welcomeModalpopup = false;
        this.Poweredpopup =false;
        this.DocumentModal= true;
    }
    Poweredbybody()
    {
        this.welcomeModalpopup = false;
        this.DocumentModal= false;
        this.Poweredpopup =true;
    }
    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length == 0) {
              this.activeSectionsMessage = 'All sections are closed';
        } else {
              this.activeSectionsMessage =
                 'Open sections: ' + openSections.join(', ');
        }

    }
    }