/* eslint-disable*/

const urlCheck = /[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%“\,\{\}\\|\\\^\[\]`]+)?$/; 

const checkDate = /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]((?:19|20)\d\d)$/
const checkImageUrl = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|pdf|jpeg|png)$/ 
const checkName =  /[a-zA-Z0-9]{3,20}$/;

export { checkDate, urlCheck, checkImageUrl, checkName};


