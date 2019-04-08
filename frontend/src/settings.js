export class Settings {
    static SERVER_URL:string = "http://" + window.location.host.split(":")[0]
    static SERVER_PORT:string = "8000";
    static APP_WIDTH:number = 800;
    //static ANOMALY_COLOR:number = 0xD9391C;

    static ANOMALY_COLORS:number[] = [0x88d1d2, 0xfb615f, 0x000000, 0xf48a8a];
    static ANOMALY_COLOR_ALPHA:number = 0.7;
    //static COLOR_BG:number = 0xfaf9f8;
    static COLOR_BG:number = 0xffffff;;
    //static COLOR_LINE_GRAPH_BG:number = 0xefedeb;
    static COLOR_LINE_GRAPH_BG:number = 0xececec;
    static COLOR_OVERVIEWSTRIP_BG:number = 0xd0d0d0;
    static COLOR_SELECTION:number = 0xa0d1f0;
    static COLOR_MENU_BG:number = 0x434440;
    static COLOR_MENU_SELECTED_ITEM:number = 0xffffff;
    static COLOR_PATHPOINT_FILL:number = 0x304860;
    static COLOR_PATHPOINT_STROKE:number = 0xA8C0D8;
    static LINE_GRAPH_BG_WIDTH:number = 900;

}
