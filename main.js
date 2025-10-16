#include <3ds.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_TEXT 512

// keyboard layouts
const char *keys_lower[] = {
    "qwertyuiop",
    "asdfghjkl[",
    "zxcvbnm,.]",
    "><|$*?;&~\""
};
const char *keys_upper[] = {
    "QWERTYUIOP",
    "ASDFGHJKL[",
    "ZXCVBNM,.]",
    "><|$*?;&~\""
};

const int ROWS = 5;  // 4 letter rows + 1 for [Space]
const int COLS = 11;

PrintConsole topScreen, bottomScreen;
int shift = 0;  // 0 = lowercase, 1 = uppercase

void draw_keyboard(int cursor_row, int cursor_col) {
    consoleSelect(&bottomScreen);
    consoleClear();

    const char **keys = shift ? keys_upper : keys_lower;

    // letter rows
    for (int r = 0; r < 4; r++) {
        int len = strlen(keys[r]);
        for (int c = 0; c < COLS; c++) {
            char ch = (c < len) ? keys[r][c] : ' ';
            if (cursor_row == r && cursor_col == c)
                printf("[%c]", ch);
            else
                printf(" %c ", ch);
        }
        printf("\n\n");
    }

    for (int c = 0; c < COLS; c++) {
        if (c == 5)
            printf("[Space]");
        else
            printf("  ");
    }

    printf("\n\nA = press\nB = delete\nY = shift\nSTART = done\n");
}

int main() {
    gfxInitDefault();
    consoleInit(GFX_TOP, &topScreen);
    consoleInit(GFX_BOTTOM, &bottomScreen);

    char text[MAX_TEXT] = {0};
    int text_len = 0;
    int cursor_row = 0, cursor_col = 0;

    draw_keyboard(cursor_row, cursor_col);

    while (aptMainLoop()) {
        hidScanInput();
        u32 kDown = hidKeysDown();

        if (kDown & KEY_UP) cursor_row = (cursor_row - 1 + ROWS) % ROWS;
        if (kDown & KEY_DOWN) cursor_row = (cursor_row + 1) % ROWS;
        if (kDown & KEY_LEFT) cursor_col = (cursor_col - 1 + COLS) % COLS;
        if (kDown & KEY_RIGHT) cursor_col = (cursor_col + 1) % COLS;

        // A press
        if (kDown & KEY_A) {
            if (cursor_row < 4) {
                const char **keys = shift ? keys_upper : keys_lower;
                if (cursor_col < strlen(keys[cursor_row]) && text_len < MAX_TEXT - 1) {
                    text[text_len++] = keys[cursor_row][cursor_col];
                    text[text_len] = 0;
                }
            } else if (cursor_col == 4) { 
                if (text_len < MAX_TEXT - 1) text[text_len++] = ' ';
                text[text_len] = 0;
            }
        }

        // B delete
        if (kDown & KEY_B) {
            text[text_len] = '\0';
            text_len--;
        }

        // Y shift toggle
        if (kDown & KEY_Y) shift ^= 1;

        // exit
        if (kDown & KEY_START) break;

        // redraw
        consoleSelect(&topScreen);
        consoleClear();
        printf("Typed: %s\n\n", text);
        draw_keyboard(cursor_row, cursor_col);

        gspWaitForVBlank();
        gfxFlushBuffers();
        gfxSwapBuffers();
    }

    gfxExit();
    return 0;
}
