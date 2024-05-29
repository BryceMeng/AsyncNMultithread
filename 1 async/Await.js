async function wait() {

    try {
    await new Promise((resolve,reject) => setTimeout(reject, 1000));
    } catch {
        console.log("error")
    }

    

    // return 10;
    return Promise.reject(500);
  }
  
  function f() {
    var abc=0;
    wait().then(value=>console.log(value), error=>console.error(error))
    console.log("abc:"+abc)
  }

  f()