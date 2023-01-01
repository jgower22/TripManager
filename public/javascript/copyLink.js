document.getElementById('copyLink').addEventListener('click', () => {

    let currentURL = window.location.href;
    let index = currentURL.lastIndexOf('/');
    let copyURL = currentURL.substring(0, index);

    navigator.clipboard.writeText(copyURL).then(
        () => {
            //Success
            if (document.getElementById('copyMessage') !== null) {
                document.getElementById('copyMessage').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'copyMessage');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Link copied!";
            document.getElementById('general_access').append(div);
        },
        () => {
            //Error
            if (document.getElementById('copyMessageError') !== null) {
                document.getElementById('copyMessageError').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'copyMessageError');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Unknown error. Please try again.";
            document.getElementById('general_access').append(div);
        }
    );
});
