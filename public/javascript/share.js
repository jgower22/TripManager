shareButton.addEventListener('click', event => {
    if (navigator.share) {
        let currentURL = window.location.href;
        let index = currentURL.lastIndexOf('/');
        let shareURL = currentURL.substring(0, index);
        let tripName = document.getElementById('tripName').value;
        navigator.share({
            title: 'Trip link for ' + tripName,
            text: 'Here is the link for ' + tripName,
            url: shareURL
        }).then(() => {
        })
        .catch(console.error);
    } else {
        if (document.getElementById('shareMessage') !== null) {
            document.getElementById('shareMessage').remove();
        }
        let div = document.createElement('div');
        div.setAttribute('id', 'shareMessage');
        div.setAttribute('class', 'error');
        div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
        div.innerHTML += "Sorry, sharing is unavailable";
        document.getElementById('general_access').append(div);
    }
});