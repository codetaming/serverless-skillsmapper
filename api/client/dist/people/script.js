$(document).ready(function () {
    var peopleUrl = "https://api.skillsmapper.org/profiles";
    $.ajax({
        url: peopleUrl
    }).then(function (data) {
        for (var i=0; i<data.length; i++)
        {
            var person = data[i];
            console.log(JSON.stringify(person));
            generateUserLink(person, "#people")
        }
    });
});

function generateUserLink(person, target) {
    var displayName = person.name === null ? person.email : person.name;
    if (person.name !== null) {
        $(target).append('<div class="column text-center"><a href="http://profile.skillsmapper.site?hash=' +
            person.hash + '""><img src="' + person.imageUrl + '" width="200px" /><br/>' + displayName + '</a></div>');
    }
}
