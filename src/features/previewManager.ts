import * as vscode from 'vscode';

import { isSvgUri } from '../utils';
import { Preview } from './preview';

export class PreviewManager implements vscode.WebviewPanelSerializer {
    private static readonly svgPreviewFocusContextKey = 'svgPreviewFocus';

    private readonly _disposables: vscode.Disposable[] = [];
    private _previews: Preview[] = [];
    private _activePreview?: Preview;

    constructor(
        private readonly _extensionPath: string
    ) {
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this), null, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this), null, this._disposables);
    }

    public async showPreview(uri: vscode.Uri, viewColumn: vscode.ViewColumn) {
        const preview =  this.getPreviewOnTargetColumn(viewColumn) || await this.createPreview(uri, viewColumn);
        preview.update(uri);
        preview.panel.reveal(preview.panel.viewColumn);
    }

    public showSource() {
        vscode.workspace.openTextDocument(this._activePreview!.source)
            .then(document => vscode.window.showTextDocument(document));
    }

    public async deserializeWebviewPanel(
		webview: vscode.WebviewPanel,
		state: any
	): Promise<void> {
        const source = vscode.Uri.parse(state.uri);
        const preview = await Preview.revive(source, webview, this._extensionPath);
        this.registerPreview(preview);
        preview.update();
	}

    public dispose(): void {
        this._disposables.forEach(ds => ds.dispose());
        this._previews.forEach(ds => ds.dispose());
    }

    private isActivePreviewUri(uri: vscode.Uri) {
        return this._activePreview && this._activePreview.source.toString() === uri.toString();
    }

    private onDidChangeActiveTextEditor(editor: vscode.TextEditor): void {
        if (editor && isSvgUri(editor.document.uri) && !this.isActivePreviewUri(editor.document.uri)) {
            this._previews.forEach(preview => {
                preview.update(editor.document.uri);
            });
        }
    }

    private onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): void {
        const preview = this.getPreviewOf(event.document.uri);
		if (preview) {
            preview.update();
		}
    }

    private async createPreview(uri: vscode.Uri, viewColumn: vscode.ViewColumn): Promise<Preview> {
        const preview = await Preview.create(uri, viewColumn, this._extensionPath);
        this.registerPreview(preview);
        return preview;
    }

    private registerPreview(preview: Preview) {
        this._previews.push(preview);
        this.onPreviewFocus(preview);
        preview.onDispose(() => {
            this.onPreviewBlur();
            this._previews.splice(this._previews.indexOf(preview), 1);
        });
    
        preview.onDidChangeViewState(({ webviewPanel }) => {                
            webviewPanel.active ? this.onPreviewFocus(preview) : this.onPreviewBlur();
        });
    }

    private onPreviewFocus(preview: Preview) {
        this._activePreview = preview;
        this.setSvgPreviewFocusContext(true);
    }
    
    private onPreviewBlur() {
        this._activePreview = undefined;
        this.setSvgPreviewFocusContext(false);
    }

    private setSvgPreviewFocusContext(value: boolean) {
        vscode.commands.executeCommand('setContext', PreviewManager.svgPreviewFocusContextKey, value);
    }

    private getPreviewOnTargetColumn(viewColumn: vscode.ViewColumn): Preview | undefined {
        const activeViewColumn = vscode.window.activeTextEditor ?
            vscode.window.activeTextEditor.viewColumn : vscode.ViewColumn.Active;

        return viewColumn === vscode.ViewColumn.Active ?
            this._previews.find(preview => preview.panel.viewColumn === activeViewColumn): 
            this._previews.find(preview => preview.panel.viewColumn === <number>activeViewColumn + 1);
    }
    
    private getPreviewOf(resource: vscode.Uri): Preview | undefined {
        return this._previews.find(p => p.source.fsPath === resource.fsPath);
	}
}