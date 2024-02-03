function onShot(el) {
    let id = el.getAttribute("data-id");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/game", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    let body = JSON.stringify({
        "cell_id": id
    });
    xhr.onreadystatechange = () => {
        let resp = JSON.parse(xhr.responseText);
        if (xhr.status != 200 && xhr.readyState != 4) {
            let window = document.querySelector("#exampleModalToggle3");
            window.classList.add("show");
            window.style = "display: block; padding-right: 15px";
            window.ariaModal = true;
            window.role = "dialog";
            let background = document.createElement("div");
            background.id = "bkg-fade"
            background.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(background);
            document.body.style = "background-color: rgb(39, 42, 49); overflow: hidden;"
            document.querySelector("#error-label").innerHTML = resp["message"];
        }
        else if (xhr.status == 200 && xhr.readyState == 4) {
            el.innerHTML = "";
            let img = new Image();
            img.style.height = "40px";
            if (resp["status"] == 0) {
                img.src = "/static/styles/images/cell-empty.png";
            }
            else if (resp["status"] == 1) {
                img.src = "/static/styles/images/cell-ship.png";
            }
            el.appendChild(img);
        }
    };
    xhr.send(body);
}

document.querySelector(".btn-close").onclick = function () {
    let window = document.querySelector("#exampleModalToggle3");
    window.classList.remove("show");
    window.style = "display: none;";
    window.style.paddingRight = "";
    window.ariaModal = false;
    window.role = "";
    document.getElementById("bkg-fade").remove();
    document.body.style = "background-color:#272A31";
}
