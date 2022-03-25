var DetectedCount = 0, DetectedCode = "";
var video, tmp, tmp_ctx, dataArr, jan, title, author1, publisher, sellingPrice, genre, syllabus, prev, prev_ctx, w, h, mw, mh, x1, y1, loop, resultTbl;

window.addEventListener('load', function (event) {
    video = document.createElement('video');
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.onloadedmetadata = function (e) { video.play(); };
    prev = document.getElementById("preview");
    prev_ctx = prev.getContext("2d");
    tmp = document.createElement('canvas');
    tmp_ctx = tmp.getContext("2d");
    // jan = document.getElementById("jan");
    // title = document.getElementById("title");
    // author1 = document.getElementById("author1");
    // publisher = document.getElementById("publisher");
    // sellingPrice = this.document.getElementById("sellingPrice");
    // genre = document.getElementById("genre");
    // syllabus = document.getElementById("syllabus");
    resultTbl = this.document.getElementById("resultTbl");
    try { getData(); console.log(dataArr) } catch (e) { console.log(e); }

    //カメラ使用の許可ダイアログが表示される
    navigator.mediaDevices.getUserMedia(
        //マイクはオフ, カメラの設定   背面カメラを希望する 640×480を希望する
        { "audio": false, "video": { "facingMode": "environment", "width": 640, "height": 480 } }
    ).then( //許可された場合
        function (stream) {
            video.srcObject = stream;
            //0.5秒毎にスキャンする
            setTimeout(Scan, 500, true);
        }
    ).catch( //許可されなかった場合
        function (err) { jan.value = err; }
    );

    function Scan(first) {
        if (first) {
            //選択された幅高さ
            w = video.videoWidth;
            h = video.videoHeight;
            //画面上の表示サイズ
            prev.style.width = (w / 2) + "px";
            prev.style.height = (h / 2) + "px";
            //内部のサイズ
            prev.setAttribute("width", w);
            prev.setAttribute("height", h);
            mw = w * 0.5;
            mh = w * 0.2;
            x1 = (w - mw) / 2;
            y1 = (h - mh) / 2;
        }
        prev_ctx.drawImage(video, 0, 0, w, h);
        prev_ctx.beginPath();
        prev_ctx.strokeStyle = "rgb(255,0,0)";
        prev_ctx.lineWidth = 2;
        prev_ctx.rect(x1, y1, mw, mh);
        prev_ctx.stroke();
        tmp.setAttribute("width", mw);
        tmp.setAttribute("height", mh);
        tmp_ctx.drawImage(prev, x1, y1, mw, mh, 0, 0, mw, mh);

        tmp.toBlob(function (blob) {
            let reader = new FileReader();
            reader.onload = function () {
                let config = {
                    decoder: {
                        readers: ["ean_reader", "ean_8_reader"],
                        multiple: false, //同時に複数のバーコードを解析しない
                    },
                    locator: { patchSize: "large", halfSample: false },
                    locate: false,
                    src: reader.result,
                };
                Quagga.decodeSingle(config, function () { });
            }
            reader.readAsDataURL(blob);
        });
        setTimeout(Scan, 50, false);
    }


    Quagga.onDetected(function (result) {
        //読み取り誤差が多いため、3回連続で同じ値だった場合に成功とする
        if (DetectedCode == result.codeResult.code) {
            DetectedCount++;
        } else {
            DetectedCount = 0;
            DetectedCode = result.codeResult.code;
        }

        if (DetectedCount === 3) {
            console.log(result.codeResult.code);
            // jan.value = result.codeResult.code;
            resultTbl.rows[1].cells[1].innerText = result.codeResult.code;
            // DetectedCode = '';
            // DetectedCount = 0;
            const dataObj = getDetails(result.codeResult.code);
            //console.log(dataObj.syllabus);
            resultTbl.rows[0].cells[1].innerText = dataObj.syllabus || "NoData";
            resultTbl.rows[2].cells[1].innerText = dataObj.title || "NoData";
            resultTbl.rows[3].cells[1].innerText = dataObj.author1 || "NoData";
            resultTbl.rows[4].cells[1].innerText = dataObj.publisher || "NoData";
            resultTbl.rows[5].cells[1].innerText = dataObj.sellingPrice || "NoData";
            resultTbl.rows[6].cells[1].innerText = dataObj.genre || "NoData";

            let target = document.getElementById("recTblBody");
            let rows = target.childElementCount / 2;

            let content = `<tr class="tblR1" id="${rows}-1">
                    <td class="mdl-data-table__cell--non-numeric recIsbn" id="${rows}-isbn">${result.codeResult.code}</td>
                    <td class="mdl-data-table__cell--non-numeric recTitle" id="${rows}-title" colspan="2">${dataObj.title}</td>
                </tr>
                <tr id="${rows}-2">
                    <td class="mdl-data-table__cell--non-numeric recStock">
                        <input type="number" step="1" value="1" id="${rows}-num">
                    </td>
                    <td class="mdl-data-table__cell--non-numeric recGenre">
                        <select id="${rows}-genre">
                            <option selected="selected" value="${dataObj.genre}">${dataObj.genre}</option>
                            <option value="英語">英語</option>
                            <option value="第二言語">第二言語</option>
                            <option value="法">法</option>
                            <option value="歴史">歴史</option>
                            <option value="政治・経済">政治・経済</option>
                            <option value="文系その他">文系その他</option>
                            <option value="数学">数学</option>
                            <option value="情報・統計">情報・統計</option>
                            <option value="理科">理科</option>
                            <option value="教職・資格">教職・資格</option>
                        </select>
                    </td>
                    <td class="mdl-data-table__cell--non-numeric recStatus" id="${rows}-status">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="option-1">`


            if (dataObj.syllabus === "優良") {
                content = content + `<input type="radio" id="option-1" class="mdl-radio__button" name="options${rows}" value="優良" checked>
                                <span class="mdl-radio__label">優良</span>
                            </label>
                            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="option-2">
                                <input type="radio" id="option-2" class="mdl-radio__button" name="options${rows}" value="不良">
                                <span class="mdl-radio__label">不良</span>
                            </label>
                        </td>
                    </tr>`
                target.insertAdjacentHTML('afterbegin', content);
            } else if (dataObj.syllabus === "不良") {
                content = content + `<input type="radio" id="option-1" class="mdl-radio__button" name="options${rows}" value="優良">
                                <span class="mdl-radio__label">優良</span>
                            </label>
                            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="option-2">
                                <input type="radio" id="option-2" class="mdl-radio__button" name="options${rows}" value="不良" checked>
                                <span class="mdl-radio__label">不良</span>
                            </label>
                        </td>
                    </tr>`
                target.insertAdjacentHTML('afterbegin', content);
            }

            if (dataObj.syllabus === "優良") {
                document.body.style.backgroundColor = "#00A0E933";
                document.getElementById("trueAudio").play();
            }
            else if (dataObj.syllabus === "不良") {
                document.body.style.backgroundColor = "#EB610033";
                document.getElementById("falseAudio").play();
            }
            else {
                document.body.style.backgroundColor = "#ffffff";
                document.getElementById("undefinedAudio").play();
            }
        }
    });


    function getData() {
        fetch(
            `https://script.google.com/macros/s/AKfycbz58JXYY83kg2gEcLDFjAMGKcM_-jxvkQmq07KsqJ74vxL-H35zGXnhJDdPm8MYCRYeNA/exec`,
            {
                method: "GET"
            }
        ).then((response) => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        }).then(function (data) {
            dataArr = data;
            console.log(dataArr);
            console.log(Object.keys(dataArr));
        }).catch(function (error) {
            console.log("fetch failed: " + error);
        });
    }

    function getDetails(isbn) {
        let min = 1;
        let max = Object.keys(dataArr).length - 1;

        while (min <= max) {
            let mid = Math.floor((min + max) / 2);

            if (Number(dataArr[mid].isbn) === Number(isbn)) {
                return dataArr[mid];
            }
            else if (Number(dataArr[mid].isbn) < Number(isbn)) {
                max = mid - 1;
            }
            else {
                min = mid + 1;
            }
        }
        return "nothing";
    }
})

document.getElementById("main").addEventListener('click', function (event) {
    DetectedCode = '';
    DetectedCount = 0;
    document.body.style.backgroundColor = "#ffffff";
    for (i = 0; i <= 6; i++) { resultTbl.rows[i].cells[1].innerText = "" };
    document.getElementById("cancelAudio").play();
});

document.getElementById("recBtn").addEventListener('click', function () {
    if (window.confirm("教科書情報を記録します")) {
        const recArr = [];
        let target = document.getElementById("recTblBody");
        let rows = target.childElementCount / 2;

        for (let i = 0; i < rows; i++) {
            let isbn = document.getElementById(`${i}-isbn`).innerHTML;
            let num = document.getElementById(`${i}-num`).value;
            let genre = document.getElementById(`${i}-genre`).value;
            let status = '';
            let elements = document.getElementsByName(`options${i}`);
            for (let j = 0; j < elements.length; j++) {
                if (elements.item(j).checked) {
                    status = elements.item(j).value;
                }
            }

            recArr.push([isbn, num, genre, status]);
        }
        sendData(recArr);
        window.alert("記録しました");
        target.innerHTML = '';

        DetectedCode = '';
        DetectedCount = 0;
        document.body.style.backgroundColor = "#ffffff";
        for (i = 0; i <= 6; i++) { resultTbl.rows[i].cells[1].innerText = "" };
        document.getElementById("cancelAudio").play();
    } else {
        // window.alert("");
    }
}, false)

function sendData(data) {
    fetch(`https://script.google.com/macros/s/AKfycbz58JXYY83kg2gEcLDFjAMGKcM_-jxvkQmq07KsqJ74vxL-H35zGXnhJDdPm8MYCRYeNA/exec`,
        {
            "method": "POST",
            "mode": "no-cors",
            "Content-Type": "application/x-www-form-urlencoded",
            "body": JSON.stringify(data)
        });
}