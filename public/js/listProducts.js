   
            let dishes = document.getElementById("dishList").children;
            let dishesLength = document.getElementById("dishList").children.length;
            
            for (let i = 0; i < dishesLength; i++) {
          
            document.getElementById(dishes[i].id).addEventListener("click",  async function (event) {
                    if (event.target.id === "orderbtn")
                    {
                      
                        const response = await fetch(`/user`, { "method": "GET" });
                        if (response.status === 200)
                        {
                     
                            response.text().then( async function (text) {
                                const response = await fetch(`/add-dishtocart/${text}?dishID=${dishes[i].id}`, { "method": "POST" });
                                    if (response.status === 200)
                                    {
                                       alert("Added To Shopping Cart");
                                    }
                                  else{
                                    alert("You have reached the maximum items");
                                  }
                            });
                        }
                        else{
                         alert(response.status);
                        }
                    }
                });
   
        }
        