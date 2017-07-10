//use in post.ejs
function back(){
    if(document.referrer === "http://127.0.0.1:3000/new") {
        window.open("http://127.0.0.1:3000/list/1", "_self");//on the same tab
    } else {
        window.history.go(-1);
    }
}