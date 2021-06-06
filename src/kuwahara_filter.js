function kuwahara_filter(src, r = 5) {
    // src: ImageData object
    // r: filter size
    const { aves, devs } = integral_img(src, r);

    for (var i = 0; i < src.height; i++) {
        for (var j = 0; j < src.width; j++) {
            let posi = indexOfMin([
                devs[i + r][j + r],
                devs[i + r][j],
                devs[i][j + r],
                devs[i][j],
            ]);
            var idx = (j + i * src.width) * 4;

            for (var c = 0; c <= 2; c++) {
                if (posi == 0) {
                    src.data[idx + c] = aves[i + r][j + r][c];
                } else if (posi == 1) {
                    src.data[idx + c] = aves[i + r][j][c];
                } else if (posi == 2) {
                    src.data[idx + c] = aves[i][j + r][c];
                } else {
                    src.data[idx + c] = aves[i][j][c];
                }
            }
        }
    }
    return src;
}

function integral_img(src, r) {
    let sum = [];
    let sqsum = [];
    for (let i = 0; i < src.height + 2 * r + 1; i++) {
        let sum_row = [];
        let sqsum_row = [];
        for (let j = 0; j < src.width + 2 * r + 1; j++) {
            sum_row.push([0, 0, 0, 0]);
            sqsum_row.push(0);
        }
        sum.push(sum_row);
        sqsum.push(sqsum_row);
    }

    for (let i = -r; i < src.height + r; i++) {
        for (let j = -r; j < src.width + r; j++) {
            let i_on_img = Math.max(0, Math.min(i, src.height - 1));
            let j_on_img = Math.max(0, Math.min(j, src.width - 1));
            let idx = (j_on_img + i_on_img * src.width) * 4;
            for (var c = 0; c < 3; c++) {
                sum[i + r + 1][j + r + 1][c] =
                    src.data[idx + c] + sum[i + r + 1][j + r][c];
            }
        }
    }
    for (var i = 0; i < src.height + 2 * r; i++) {
        for (var j = 0; j < src.width + 2 * r; j++) {
            for (var c = 0; c < 3; c++) {
                sum[i + 1][j + 1][c] += sum[i][j + 1][c];
                sum[i + 1][j + 1][3] += sum[i + 1][j + 1][c];
            }
        }
    }

    for (let i = -r; i < src.height + r; i++) {
        for (let j = -r; j < src.width + r; j++) {
            // min and max are for image padding
            let i_on_img = Math.max(0, Math.min(i, src.height - 1));
            let j_on_img = Math.max(0, Math.min(j, src.width - 1));
            let idx = (j_on_img + i_on_img * src.width) * 4;
            let uni_sq =
                (src.data[idx] + src.data[idx + 1] + src.data[idx + 2]) ** 2;
            sqsum[i + r + 1][j + r + 1] = sqsum[i + r + 1][j + r] + uni_sq;
        }
    }

    for (var i = 0; i < src.height + 2 * r; i++) {
        for (var j = 0; j < src.width + 2 * r; j++) {
            sqsum[i + 1][j + 1] += sqsum[i][j + 1];
        }
    }

    let aves = [];
    let devs = [];
    const area = (1 + r) * (1 + r);

    for (let i = 0; i < src.height + r; i++) {
        let ave_row = [];
        let dev_row = [];
        for (let j = 0; j < src.width + r; j++) {
            let ave_rgb = [];
            for (let c = 0; c < 3; c++) {
                ave_rgb.push(
                    (sum[i + r + 1][j + r + 1][c] -
                        sum[i][j + r + 1][c] -
                        sum[i + r + 1][j][c] +
                        sum[i][j][c]) /
                        area
                );
            }
            ave_row.push(ave_rgb);
            dev_row.push(
                (sqsum[i + r + 1][j + r + 1] -
                    sqsum[i][j + r + 1] -
                    sqsum[i + r + 1][j] +
                    sqsum[i][j]) /
                    area -
                    ((sum[i + r + 1][j + r + 1][3] -
                        sum[i][j + r + 1][3] -
                        sum[i + r + 1][j][3] +
                        sum[i][j][3]) /
                        area) **
                        2
            );
        }
        aves.push(ave_row);
        devs.push(dev_row);
    }
    return { aves: aves, devs: devs };
}

function indexOfMin(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }
    return minIndex;
}
