pragma solidity ^0.4.16;

contract CustomContract {

    uint[] public values_pre;
    uint[] public values_post;


    function runAccessPre() returns(uint)
    {
      uint result = 1;
      values_pre.push(result);
      return result;
    }

    function runAccessPost() returns(uint)
    {
      uint result = 1;
      values_post.push(result);
      return result;
    }


}