function setCookie(c_name, value, expiredays, cookiePath) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + '=' + escape(value) +
        ((expiredays == null) ? '' : ';expires=' + exdate.toUTCString()) +
        ((cookiePath == null) ? '' : ';path=' + cookiePath);
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + '=');
        if (c_start !== -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(';', c_start);
            if (c_end === -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return '';
}

function displayResults(votePath, identifier) {
    executeCall(votePath, {}, identifier, false);
}

function doVote(answers, votePath, identifier, cookiePath, userIdentifier) {
    var answerUUID = null;
    $('#form_' + identifier + ' input:checked[name=\'voteAnswer\']').each(function () {
        answerUUID = $(this).val();
    });

    if (answerUUID == null) {
        alert('Please select an answer');
        return false;
    }

    var data = {
        answerUUID: answerUUID
    };
    if (document.forms['tokenform_' + identifier]) {
        data['form-token'] = $('#tokenform_' + identifier + ' input[name=\'form-token\']').val();
    }

    executeCall(votePath, data, identifier, true, userIdentifier, cookiePath);
}

function executeCall(votePath, data, identifier, withCookie, userIdentifier, cookiePath) {
    $.post(votePath + '.pollVote.do', data, function (result) {
        var answers = result.answerNodes;
        var statDivTest = document.getElementById('statContainer_' + identifier);

        if (statDivTest != null) {
            statDivTest.parentNode.removeChild(statDivTest);
        }

        var statDiv = document.createElement('div');
        statDiv.id = 'statContainer_' + identifier;
        var pollVotes = Math.floor(result.totalOfVotes);

        for (var i = 0; i < answers.length; i++) {
            var statAnswerLabel = document.createElement('div');
            statAnswerLabel.id = 'statContainer_' + identifier + '_label_a' + [i];
            statAnswerLabel.innerHTML = answers[i].label;

            var statAnswerValue = document.createElement('div');
            statAnswerValue.id = 'statContainer_' + identifier + '_value_a' + [i];
            statAnswerValue.innerHTML = answers[i].nbOfVotes;
            var answerVotes = Math.floor(answers[i].nbOfVotes);
            var percentage = (answerVotes == 0 || pollVotes == 0) ? 0 : answerVotes / pollVotes * 100;
            statAnswerValue.style.width = (percentage * 1) + '%';
            statAnswerValue.className = 'barPoll barPollColor' + [i % 8];

            statDiv.appendChild(statAnswerLabel);
            statDiv.appendChild(statAnswerValue);
        }

        $('.stats_' + identifier).append(statDiv);
        if (withCookie) {
            setCookie('poll' + userIdentifier + identifier, 'true', 365, cookiePath);
        }
        $('.pollForm' + identifier).hide();
    }, 'json');
}
