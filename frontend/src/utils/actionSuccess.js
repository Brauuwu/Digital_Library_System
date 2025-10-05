export default function actionSuccess(toast, message, title){
  try{
    toast.push({ type: 'success', message, title });
  }catch(e){
    try{ window.dispatchEvent(new Event('action:success')); }catch(_){}
  }
  try{ window.dispatchEvent(new Event('action:success')); }catch(e){}
}
