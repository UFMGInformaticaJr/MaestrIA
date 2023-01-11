const axios = require('axios');
require ('dotenv').config();

const token = process.env.TOKEN;
  
const api = axios.create({
    baseURL: 'https://portal.maestriaapis.maestrialaw.com.br',
    headers: { Authorization: `Bearer ${token}` }
});

// interface CreateLog {
//   jobs_collect_queues_calls_id: number;
//   logs_message_erros: string;
//   logs_type_erros_id: number;
//   status_collect: number;
//   url_collection: string;
// }

// interface CreateLogJobsCollectQueuesCalls {
//   queues_id: number,
//   playload : string,
//   tot_pages: number,
//   resultado: number
// }

// interface GetRegisterData {
//   data: JSON,
//   fields_value: JSON, 
//   fields_name: string,
//   path_and_name_file:string 
// }

// interface InsertRegisterData {
//   data: JSON; 
//   name_file: string;
//   path_collection: string;
//   name_table: string;
// }


class RequestService {
  constructor() {
    this.api = api;
    
  }

  async getID() {
    try{
        const response = await this.api.get('/get-crawler-id');
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async errorLog(id_job){
    try{
        const response = await this.api.post('/get-error-log', {id_job: id_job});
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async createLog(  
    jobs_collect_queues_calls_id,
    logs_message_errors,
    logs_type_errors_id,
    status_collect,
    url_collection
    ){
    try{
        const response = await this.api.post('/put-create-log', {
          jobs_collect_queues_calls_id: jobs_collect_queues_calls_id,
          logs_message_errors: logs_message_errors,
          logs_type_errors_id: logs_type_errors_id,
          status_collect: status_collect,
          url_collection: url_collection
        });
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async createLogJobsCollectQueuesCalls( 
    queues_id,
    playload ,
    tot_page,
    resultado
    ){
    try{
        const response = await this.api.post('/put-create-log-jobs-collect-queues-calls', {
          queues_id: queues_id,
          playload : playload,
          tot_page: tot_page,
          resultado: resultado
          });
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async getRegisterData (path, file){
    try{
        const response = await this.api.post('get-register-data-collection-s3', {path: path, file: file});
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async putRegisterData (  
    data,
    fields_value, 
    fields_name,
    path_and_name_file
    ){
    try{
        const response = await this.api.post('put-register-data-collection-s3', {
          data: data, fields_value: fields_value, 
          fields_name: fields_name, 
          path_and_name_file: path_and_name_file
        });
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

  async insertRegisterData ( 
    data,
    name_file,
    path_collection,
    name_table
    ){
    try{
        const response = await this.api.post('insert-register-data-collection-s3', {
          data: data, 
          name_file: name_file, 
          path_collection: path_collection, 
          name_table: name_table}
        );
        return response.data;
    }
    catch(error){
        console.log(error)
    }
  }

}


module.exports = new RequestService;