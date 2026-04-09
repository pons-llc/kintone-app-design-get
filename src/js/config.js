((PLUGIN_ID) => {
    function updateDatalist(dataObj) {
        const dataList = document.getElementById("json-options");
        const inputField = document.getElementById("search-input");

        dataList.innerHTML = "";

        // オブジェクトのキーと値をループ
        Object.entries(dataObj).forEach(([key, value]) => {
            const option = document.createElement('option');

            // 確定時にinputに入力させたいのは「キー（code）」
            option.value = key;

            // ユーザーに見せる表示名・検索対象として「値（name）」をセット
            option.textContent = value;

            dataList.appendChild(option);
        });

        // 読み込み完了後に、inputを使えるようにする
        if (inputField) {
            inputField.disabled = false;
            inputField.placeholder = "キーワードを入力...";
        }
    }

    const getRoles = async () => {
        let offset = 0;
        let recordsCount = 100;
        let roles = [];

        while (recordsCount === 100) {
            const currentRoles = await kintone.api(kintone.api.url("/v1/groups.json", false), "GET", { offset: offset });

            const fetchedGroups = currentRoles.groups || [];
            recordsCount = fetchedGroups.length;
            offset += 100;

            roles = roles.concat(fetchedGroups);
        }
        return roles;
    }

    // プラグイン設定画面の初期化処理
    window.onload = async () => {
        const inputField = document.getElementById("search-input");
        const saveButton = document.getElementById("save-button"); // 保存ボタンの要素を取得

        // 【追加】1. configの初期値取得と反映
        const config = kintone.plugin.app.getConfig(PLUGIN_ID);
        // 過去に保存された 'selectedGroup' があれば、inputの初期値としてセットする
        if (config.selectedGroup && inputField) {
            inputField.value = config.selectedGroup;
        }

        // データの取得とdatalistの更新（非同期処理）
        const response = await getRoles();
        const roleData = response.reduce((acc, el) => {
            acc[el.code] = el.name;
            return acc;
        }, {});

        updateDatalist(roleData);

        // 【追加】2. 保存ボタン押下時の処理
        if (saveButton && inputField) {
            saveButton.addEventListener("click", () => {
                const selectedValue = inputField.value;

                // 未入力チェック（必要に応じて）
                if (!selectedValue) {
                    alert("値を選択または入力してください。");
                    return;
                }

                // configの保存処理
                // kintone.plugin.app.setConfig() を呼ぶと、保存後に自動的に設定画面がリロードされ、アプリ設定画面に戻ります。
                kintone.plugin.app.setConfig({
                    selectedGroup: selectedValue
                });
            });
        }
    }

})(kintone.$PLUGIN_ID);