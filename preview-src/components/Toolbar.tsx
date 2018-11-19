import { h, FunctionalComponent } from 'preact';

interface ToolbarProps {
    onChangeBackgroundButtonClick: JSX.MouseEventHandler;
    zoomIn: Function;
    zoomOut: Function;
    zoomReset: Function;
    fileSize?: string;
    background: string;
    sourceImageValidity: boolean;
    onBtnMouseDown: JSX.MouseEventHandler;
    onBtnMouseUp: JSX.MouseEventHandler;
    activeBtn?: string;
}

const Toolbar: FunctionalComponent<ToolbarProps> = ({
     onChangeBackgroundButtonClick, zoomIn, zoomOut, zoomReset, fileSize, background, sourceImageValidity, onBtnMouseDown, onBtnMouseUp, activeBtn
    }) => (
    <div className="toolbar">
        <div className="btn-group">
            <button 
                name="zoom-in"
                className={`reset-button btn btn-plus ${activeBtn === 'zoom-in'? 'active' : ''}`}
                disabled={!sourceImageValidity}
                onClick={zoomIn as JSX.MouseEventHandler}
                onMouseDown={onBtnMouseDown}
                onMouseUp={onBtnMouseUp}
            />
            <button
                name="zoom-out"
                className={`reset-button btn btn-minus ${activeBtn === 'zoom-out'? 'active' : ''}`}
                disabled={!sourceImageValidity}
                onClick={zoomOut as JSX.MouseEventHandler}
                onMouseDown={onBtnMouseDown}
                onMouseUp={onBtnMouseUp}
            />
            <button
                name="reset"
                className={`reset-button btn btn-one-to-one ${activeBtn === 'reset'? 'active' : ''}`}
                disabled={!sourceImageValidity}
                onClick={zoomReset as JSX.MouseEventHandler}
                onMouseDown={onBtnMouseDown}
                onMouseUp={onBtnMouseUp}
            />
        </div>
        <div className="separator" />
        <div className="bg-group">
            <div className={`bg-container ${background === 'dark' ? 'selected' : ''}`}>
                <button
                    disabled={!sourceImageValidity}
                    className="reset-button bg dark"
                    name="dark"
                    onClick={onChangeBackgroundButtonClick} 
                />
            </div>
            <div className={`bg-container ${background === 'light' ? 'selected' : ''}`}>
                <button
                    disabled={!sourceImageValidity}
                    className="reset-button bg light"
                    name="light"
                    onClick={onChangeBackgroundButtonClick} 
                />
            </div>
            <div className={`bg-container ${background === 'transparent' ? 'selected' : ''}`}>
                <button
                    disabled={!sourceImageValidity}
                    className="reset-button bg transparent"
                    name="transparent"
                    onClick={onChangeBackgroundButtonClick} 
                />
            </div>
        </div>
        <div className="size">{fileSize}</div>
    </div>
);

export default Toolbar;