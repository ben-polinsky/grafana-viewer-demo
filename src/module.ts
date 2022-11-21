import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from 'common/types';
import { Panel } from './Panel';

;(window as any).ITWIN_VIEWER_HOME = `https://${window.location.host}/public/plugins/benpolinsky-itwin-viewer`

export const plugin = new PanelPlugin<PanelOptions>(Panel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: "redirectUrl",
      name: "Redirect URL",
      description: "redirect ur to register with itwin oidc",
      defaultValue: "",
    })
    .addTextInput({
      path: "clientId",
      name: "Client ID",
      description: "",
      defaultValue: "",
    })
    .addTextInput({
      path: "scope",
      name: "Scope",
      description: "",
      defaultValue: "imodelaccess:read imodels:read realitydata:read",
    })
    .addTextInput({
      path: "iTwinId",
      name: "iTwin ID",
      description: "",
      defaultValue: "",
    })
    .addTextInput({
      path: "iModelId",
      name: "iModel ID",
      description: "",
      defaultValue: "",
    });
});
