function toggleFormActivation() {

    let checkBox = document.getElementById("admin");

    let form = document.getElementById("Form");

    if (checkBox.checked) {
        form.disabled = false;
    } else {
        form.disabled = true;
    }

}