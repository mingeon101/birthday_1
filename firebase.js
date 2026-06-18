import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    push
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* =================================
   Firebase 설정
================================= */

const firebaseConfig = {

    apiKey:
    "AIzaSyCd7LUP_IDnbdLgIxyj6iGEFtwXbzwubjc",

    authDomain:
    "database-4d830.firebaseapp.com",

    databaseURL:
    "https://database-4d830-default-rtdb.firebaseio.com",

    projectId:
    "database-4d830",

    storageBucket:
    "database-4d830.firebasestorage.app",

    messagingSenderId:
    "1011786036842",

    appId:
    "1:1011786036842:web:f645d6af597e0c22b4bc13"
};

/* =================================
   Firebase 시작
================================= */

const app =
    initializeApp(
        firebaseConfig
    );

export const db =
    getDatabase(
        app
    );

/* =================================
   상품 불러오기
================================= */

export async function loadPrizes(){

    try{

        const snapshot =
            await get(
                ref(
                    db,
                    "prizes"
                )
            );

        if(
            !snapshot.exists()
        ){
            return [];
        }

        const data =
            snapshot.val();

        return Object.keys(
            data
        ).map(
            key => ({
                id:key,
                ...data[key]
            })
        );

    }catch(err){

        console.error(
            err
        );

        return [];
    }
}

/* =================================
   랜덤 상품
================================= */

export async function getRandomPrize(){

    const prizes =
        await loadPrizes();

    const available =
        prizes.filter(
            p =>
            (p.stock || 0) > 0
        );

    if(
        available.length === 0
    ){
        return null;
    }

    const index =
        Math.floor(
            Math.random()
            *
            available.length
        );

    return available[
        index
    ];
}

/* =================================
   당첨 저장
================================= */

export async function saveWin(
    prize
){

    try{

        const winsRef =
            ref(
                db,
                "wins"
            );

        const newRef =
            push(
                winsRef
            );

        await set(
            newRef,
            {

                prizeId:
                    prize.id,

                name:
                    prize.name,

                image:
                    prize.image || "",

                url:
                    prize.url || "",

                time:
                    Date.now()

            }
        );

        return true;

    }catch(err){

        console.error(
            err
        );

        return false;
    }
}

/* =================================
   재고 감소
================================= */

export async function decreaseStock(
    prize
){

    try{

        const stockRef =
            ref(
                db,
                `prizes/${prize.id}/stock`
            );

        const snapshot =
            await get(
                stockRef
            );

        if(
            !snapshot.exists()
        ){
            return;
        }

        const stock =
            snapshot.val();

        await set(
            stockRef,
            Math.max(
                0,
                stock - 1
            )
        );

    }catch(err){

        console.error(
            err
        );
    }
}
