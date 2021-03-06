import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "documentDataFilter"
})
export class DocumentDataFilterPipe implements PipeTransform {
    transform(array: any[], query: string): any {
        if (query) {
            return _.filter(array, row=>((row.userName.toLowerCase().indexOf(query.toLowerCase())> -1)||
            (row.role.toLowerCase().indexOf(query.toLowerCase())> -1)))
        }
        return array;
    }
}
