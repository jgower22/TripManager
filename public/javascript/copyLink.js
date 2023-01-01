document.getElementById('copyLink').addEventListener('click', () => {

    let currentURL = window.location.href;
    let index = currentURL.lastIndexOf('/');
    let copyURL = currentURL.substring(0, index);

    navigator.clipboard.writeText(copyURL).then(
        () => {
            //Success
            if (document.getElementById('shareMessage') !== null) {
                document.getElementById('shareMessage').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'shareMessage');
            div.setAttribute('class', 'success');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Link copied!";
            document.getElementById('general_access').append(div);
        },
        () => {
            //Error
            if (document.getElementById('shareMessage') !== null) {
                document.getElementById('shareMessage').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'shareMessage');
            div.setAttribute('class', 'error');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Unknown error. Please try again.";
            document.getElementById('general_access').append(div);
        }
    );
});
