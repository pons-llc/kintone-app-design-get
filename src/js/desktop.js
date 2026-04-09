(async (PLUGIN_ID) => {
    const appId = kintone.app.getId();

    const items = [
        'app/form/layout.json',
        'app/form/fields.json',
        'app/settings.json',
        'app/status.json',
        'app/notifications/general.json',
        'app/notifications/perRecord.json',
        'app/notifications/reminder.json',
        'app/acl.json',
        'record/acl.json',
        'field/acl.json',
        'form.json',
        'app/actions.json',
        'app/views.json',
        'app/reports.json'
    ];

    const saveAsJson = async (items) => {
        const conf = confirm("設定情報を保存しますか？")
        if (conf) {
            const obj = {}
            for (let i = 0; i < items.length; i++) {
                const jsn = await kintone.api(kintone.api.url(`/k/v1/${items[i]}`, true), "GET", { app: appId })
                obj[items[i]] = jsn
            }
            const jsonStr = JSON.stringify(obj, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `${appId}_design.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    kintone.events.on("app.record.index.show", async (event) => {
        const config = kintone.plugin.app.getConfig(PLUGIN_ID)
        const ownerRole = config?.selectedGroup || ""
        if (!document.getElementById("design-save") && ownerRole) {
            const userHasRole = await kintone.user.getGroups(kintone.getLoginUser().code)
            if (userHasRole.some(el => el.code === ownerRole)) {
                const button = document.createElement('button');
                button.id = "design-save";
                button.type = 'button';
                button.textContent = '設計保存';
                button.style.position = 'fixed';
                button.style.right = '20px';
                button.style.bottom = '20px';
                button.style.zIndex = '2000';
                button.style.padding = '12px 16px';
                button.style.border = 'none';
                button.style.borderRadius = '999px';
                button.style.background = '#1e88e5';
                button.style.color = '#fff';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                button.style.cursor = 'pointer';
                document.body.appendChild(button)
                button.addEventListener("click", () => {
                    saveAsJson(items)
                })
            }

        }
        return event
    })



})(kintone.$PLUGIN_ID);