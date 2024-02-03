localStorage.setItem("data-mode", document.documentElement.getAttribute("data-mode"));
let modes = ["normal", "add-ship", "select-ship", "ship-ready"];

function onFieldCreation() {

}

function setMode(mode) { // change edition mode
    if (modes.includes(mode)) {
        localStorage.setItem("data-mode", mode);
        document.documentElement.setAttribute("data-mode", mode);
    }
}

function getMode() {
    let mode = localStorage.getItem("data-mode");
    if (document.documentElement.getAttribute("data-mode") == mode) {
        return mode;
    }
    return null;
}

function modeChange() { // on mode change button click
    if (document.querySelector(".form-select").value != 0) {
        let mode = document.documentElement.getAttribute("data-mode");
        localStorage.setItem("data-mode", mode);
        let new_mode = modes[(modes.findIndex(i => i === mode) + 1) % modes.length];
        setMode(new_mode);
    }
}

function onOptionChange(el) {
    let size = el.value;
    if (size == 0) setMode("normal");
    let field = document.querySelector(".field");
    field.innerHTML = "";
    for (let i = 0; i < size; ++i) {
        let row = document.createElement("div");
        row.classList.add("field__row");
        for (let j = 0; j < size; ++j) {
            let img = new Image();
            img.style.height = "40px";
            img.src = "/static/styles/images/cell-empty.png";
            let elem = document.createElement("div");
            elem.classList.add("cell");
            elem.setAttribute("x", j);
            elem.setAttribute("y", i);
            elem.appendChild(img);

            elem.addEventListener("click", () => { // on cell click
                if (getMode() == "add-ship") {
                    let img1 = new Image();
                    img1.style.height = "40px";
                    img1.src = "/static/styles/images/cell-ship.png";
                    elem.innerHTML = "";
                    elem.appendChild(img1);
                    let button = document.querySelector(".button-start");
                    button.classList.remove("button-start");
                    button.classList.add("button-unavailable");
                    button.removeEventListener("click", modeChange);
                    localStorage.setItem("x", elem.getAttribute("x")); // x of selected cell
                    localStorage.setItem("y", elem.getAttribute("y")); // y of selected cell
                    setMode("select-ship");
                }
            });
            elem.addEventListener("hover", () => {
                if (getMode() == "select-ship") { // if a cell was selected
                    // get elements by x or y values
                }
            });
            row.appendChild(elem);
        }
        field.appendChild(row);
    }
}
